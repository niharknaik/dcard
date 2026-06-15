<?php

namespace App\Services;

use App\Enums\NotificationType;
use App\Enums\PaymentStatus;
use App\Mail\PaymentSuccessMail;
use App\Models\Payment;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    public function __construct(
        private readonly RazorpayService $razorpay,
        private readonly SubscriptionService $subscriptions,
        private readonly NotificationService $notifications,
        private readonly GooglePlayService $googlePlay,
    ) {}

    /**
     * Begin a checkout: create a pending payment + a Razorpay order. The client
     * uses the returned order to open Razorpay Checkout.
     *
     * @return array{payment: Payment, order: array, razorpay_key: ?string}
     */
    public function checkout(User $user, SubscriptionPlan $plan): array
    {
        if (! $plan->is_active) {
            throw ValidationException::withMessages(['plan' => ['This plan is not available.']]);
        }

        if ((float) $plan->price <= 0) {
            throw ValidationException::withMessages(['plan' => ['The free plan does not require checkout.']]);
        }

        $payment = Payment::create([
            'user_id' => $user->id,
            'subscription_plan_id' => $plan->id,
            'gateway' => 'razorpay',
            'transaction_id' => 'TXN-'.strtoupper(Str::random(14)),
            'amount' => $plan->price,
            'currency' => $plan->currency,
            'status' => PaymentStatus::Created,
        ]);

        $order = $this->razorpay->createOrder((float) $plan->price, $plan->currency, $payment->transaction_id);

        $payment->update(['razorpay_order_id' => $order['id']]);

        return [
            'payment' => $payment->refresh(),
            'order' => $order,
            'razorpay_key' => config('services.razorpay.key'),
        ];
    }

    /**
     * Verify a completed checkout and activate the subscription.
     *
     * @throws ValidationException on signature mismatch.
     */
    public function verify(User $user, array $data): Payment
    {
        $payment = Payment::where('razorpay_order_id', $data['razorpay_order_id'])
            ->where('user_id', $user->id)
            ->firstOrFail();

        if ($payment->status === PaymentStatus::Paid) {
            return $payment; // idempotent
        }

        $valid = $this->razorpay->verifyPaymentSignature(
            $data['razorpay_order_id'],
            $data['razorpay_payment_id'],
            $data['razorpay_signature'],
        );

        if (! $valid) {
            $this->markFailed($payment);
            throw ValidationException::withMessages(['payment' => ['Payment verification failed.']]);
        }

        return $this->markPaidAndActivate($payment, $data['razorpay_payment_id'], $data['razorpay_signature']);
    }

    /**
     * Handle a verified Razorpay webhook payload (idempotent).
     */
    public function handleWebhook(array $payload): void
    {
        $event = $payload['event'] ?? null;
        $entity = data_get($payload, 'payload.payment.entity', []);
        $orderId = $entity['order_id'] ?? null;

        if (! $orderId) {
            return;
        }

        $payment = Payment::where('razorpay_order_id', $orderId)->first();

        if (! $payment) {
            return;
        }

        match ($event) {
            'payment.captured' => $payment->status === PaymentStatus::Paid
                ? null
                : $this->markPaidAndActivate($payment, $entity['id'] ?? null, null),
            'payment.failed' => $payment->status === PaymentStatus::Paid ? null : $this->markFailed($payment),
            default => null,
        };
    }

    /**
     * Verify a Google Play subscription purchase and activate the plan.
     *
     * Google is the source of truth for which product was bought: we look the
     * plan up by its play_product_id and ignore any client-sent plan id.
     *
     * @param  array{purchase_token:string, product_id:string}  $data
     *
     * @throws ValidationException when no plan maps to the verified product.
     */
    public function verifyPlay(User $user, array $data): Payment
    {
        $purchaseToken = $data['purchase_token'];
        $productId = $data['product_id'];

        // Throws (fails closed) if the token is invalid / expired / unpaid.
        $receipt = $this->googlePlay->verifySubscription($productId, $purchaseToken);

        $plan = SubscriptionPlan::where('play_product_id', $productId)->first();

        if (! $plan) {
            throw ValidationException::withMessages([
                'product_id' => ['No subscription plan matches this Google Play product.'],
            ])->status(404);
        }

        $orderId = $receipt['orderId'] ?? null;

        // Idempotency keyed on the PURCHASE TOKEN. Google does not guarantee an
        // orderId on every subscription state, so it cannot be the key — keying
        // on a null orderId would compile to `= NULL` (never matches) and let a
        // repeat verification grant the subscription again / collide on the
        // unique transaction_id.
        $existing = Payment::where('gateway', 'google_play')
            ->where('user_id', $user->id)
            ->where('meta->purchase_token', $purchaseToken)
            ->first();

        if ($existing) {
            // Already fully processed — return as-is.
            if ($existing->status === PaymentStatus::Paid) {
                return $existing;
            }

            // A prior attempt created the row but failed before activation
            // completed; resume rather than create a duplicate payment.
            $existing = $this->activateForPlan($existing, $plan);
            $this->googlePlay->acknowledgeSubscription($productId, $purchaseToken);

            return $existing;
        }

        $payment = Payment::create([
            'user_id' => $user->id,
            'subscription_plan_id' => $plan->id,
            'gateway' => 'google_play',
            'transaction_id' => $orderId ?: 'GPA-'.strtoupper(Str::random(14)),
            'amount' => $plan->price,
            'currency' => $plan->currency,
            'status' => PaymentStatus::Created,
            'meta' => ['purchase_token' => $purchaseToken, 'product_id' => $productId],
        ]);

        $payment = $this->activateForPlan($payment, $plan);

        // Acknowledge last so a settled-but-unacknowledged purchase is not lost.
        $this->googlePlay->acknowledgeSubscription($productId, $purchaseToken);

        return $payment;
    }

    private function markPaidAndActivate(Payment $payment, ?string $razorpayPaymentId, ?string $signature): Payment
    {
        return $this->activateForPlan($payment, $payment->plan, [
            'razorpay_payment_id' => $razorpayPaymentId,
            'razorpay_signature' => $signature,
        ]);
    }

    /**
     * Shared post-verification activation used by BOTH the Razorpay and the
     * Google Play paths: activate the subscription, mark the payment paid,
     * generate the invoice number, and notify the user.
     *
     * @param  array<string, mixed>  $extra  gateway-specific columns to persist
     */
    private function activateForPlan(Payment $payment, SubscriptionPlan $plan, array $extra = []): Payment
    {
        return DB::transaction(function () use ($payment, $plan, $extra) {
            $user = $payment->user;

            $subscription = $this->subscriptions->activate($user, $plan);

            $payment->update(array_merge($extra, [
                'status' => PaymentStatus::Paid,
                'paid_at' => now(),
                'invoice_number' => $this->generateInvoiceNumber(),
                'subscription_id' => $subscription->id,
            ]));

            $this->notifications->send(
                $user,
                NotificationType::PaymentSuccess,
                'Payment successful',
                "We received your payment of {$payment->currency} ".number_format((float) $payment->amount, 2).'.',
                ['payment_id' => $payment->id, 'invoice' => $payment->invoice_number],
            );

            if ($user->email) {
                Mail::to($user->email)->queue(new PaymentSuccessMail($payment->refresh()));
            }

            return $payment->refresh();
        });
    }

    private function markFailed(Payment $payment): void
    {
        $payment->update(['status' => PaymentStatus::Failed]);

        if ($payment->user) {
            $this->notifications->send(
                $payment->user,
                NotificationType::PaymentFailed,
                'Payment failed',
                'Your recent payment could not be completed. Please try again.',
                ['payment_id' => $payment->id],
            );
        }
    }

    private function generateInvoiceNumber(): string
    {
        $sequence = Payment::whereNotNull('invoice_number')->count() + 1;

        return 'INV-'.now()->format('Ym').'-'.str_pad((string) $sequence, 6, '0', STR_PAD_LEFT);
    }
}
