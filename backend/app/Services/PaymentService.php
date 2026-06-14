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

    private function markPaidAndActivate(Payment $payment, ?string $razorpayPaymentId, ?string $signature): Payment
    {
        return DB::transaction(function () use ($payment, $razorpayPaymentId, $signature) {
            $user = $payment->user;
            $plan = $payment->plan;

            $subscription = $this->subscriptions->activate($user, $plan);

            $payment->update([
                'razorpay_payment_id' => $razorpayPaymentId,
                'razorpay_signature' => $signature,
                'status' => PaymentStatus::Paid,
                'paid_at' => now(),
                'invoice_number' => $this->generateInvoiceNumber(),
                'subscription_id' => $subscription->id,
            ]);

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
