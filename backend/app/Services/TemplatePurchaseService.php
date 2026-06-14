<?php

namespace App\Services;

use App\Enums\RewardSource;
use App\Enums\TemplatePurchaseStatus;
use App\Enums\TemplateUnlockMethod;
use App\Models\RewardSetting;
use App\Models\Template;
use App\Models\TemplatePurchase;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Unlocking templates via three methods: free, reward points, money (Razorpay),
 * or a money + points combination. Reuses the existing RazorpayService gateway.
 *
 * Money/mixed unlocks return a Razorpay order to be completed client-side, then
 * confirmed through verify() — mirroring the subscription checkout flow.
 */
class TemplatePurchaseService
{
    public function __construct(
        private readonly RazorpayService $razorpay,
        private readonly RewardService $rewards,
    ) {}

    /**
     * Begin (and where possible immediately complete) a template unlock.
     *
     * @return array{status:string, purchase:TemplatePurchase, requires_payment:bool, order?:array, razorpay_key?:?string}
     */
    public function unlock(User $user, Template $template, string $method): array
    {
        if (! $template->is_active) {
            throw ValidationException::withMessages(['template' => ['This template is not available.']]);
        }

        $existing = TemplatePurchase::where('user_id', $user->id)
            ->where('template_id', $template->id)
            ->first();

        if ($existing && $existing->status === TemplatePurchaseStatus::Completed) {
            return ['status' => 'completed', 'purchase' => $existing, 'requires_payment' => false];
        }

        // Anything with no money and no points cost unlocks for free.
        if ($template->isFreeToUnlock()) {
            return ['status' => 'completed', 'purchase' => $this->completeFree($user, $template), 'requires_payment' => false];
        }

        $unlock = TemplateUnlockMethod::tryFrom($method);
        if ($unlock === null) {
            throw ValidationException::withMessages(['method' => ['Unsupported unlock method.']]);
        }

        return match ($unlock) {
            TemplateUnlockMethod::Points => [
                'status' => 'completed',
                'purchase' => $this->completeWithPoints($user, $template),
                'requires_payment' => false,
            ],
            TemplateUnlockMethod::Money => $this->startMoneyCheckout($user, $template, mixed: false),
            TemplateUnlockMethod::Mixed => $this->startMoneyCheckout($user, $template, mixed: true),
            default => throw ValidationException::withMessages(['method' => ['Unsupported unlock method.']]),
        };
    }

    /** Confirm a money/mixed unlock after Razorpay checkout. */
    public function verify(User $user, array $data): TemplatePurchase
    {
        $purchase = TemplatePurchase::where('razorpay_order_id', $data['razorpay_order_id'])
            ->where('user_id', $user->id)
            ->firstOrFail();

        if ($purchase->status === TemplatePurchaseStatus::Completed) {
            return $purchase;
        }

        $valid = $this->razorpay->verifyPaymentSignature(
            $data['razorpay_order_id'],
            $data['razorpay_payment_id'],
            $data['razorpay_signature'],
        );

        if (! $valid) {
            $purchase->update(['status' => TemplatePurchaseStatus::Failed]);
            throw ValidationException::withMessages(['payment' => ['Payment verification failed.']]);
        }

        return DB::transaction(function () use ($purchase, $user, $data) {
            // Mixed unlocks also spend the reserved points — debit them now.
            if ($purchase->points_spent > 0) {
                $this->rewards->debit(
                    $user,
                    RewardSource::TemplateRedemption,
                    $purchase->points_spent,
                    "Points applied to template #{$purchase->template_id}",
                    $purchase,
                );
            }

            $purchase->update([
                'razorpay_payment_id' => $data['razorpay_payment_id'],
                'razorpay_signature'  => $data['razorpay_signature'],
                'status'              => TemplatePurchaseStatus::Completed,
                'paid_at'             => now(),
            ]);

            $purchase->template()->increment('purchases_count');

            return $purchase->refresh();
        });
    }

    // ---------------- internals ----------------

    private function completeFree(User $user, Template $template): TemplatePurchase
    {
        return DB::transaction(function () use ($user, $template) {
            $purchase = TemplatePurchase::updateOrCreate(
                ['user_id' => $user->id, 'template_id' => $template->id],
                [
                    'unlock_method' => TemplateUnlockMethod::Free,
                    'amount'        => 0,
                    'currency'      => $template->currency,
                    'points_spent'  => 0,
                    'status'        => TemplatePurchaseStatus::Completed,
                    'paid_at'       => now(),
                ],
            );

            $template->increment('purchases_count');

            return $purchase;
        });
    }

    private function completeWithPoints(
        User $user,
        Template $template,
        ?int $pointsOverride = null,
        TemplateUnlockMethod $method = TemplateUnlockMethod::Points,
    ): TemplatePurchase {
        $points = $pointsOverride ?? (int) $template->price_points;

        if ($points <= 0) {
            throw ValidationException::withMessages(['method' => ['This template cannot be unlocked with points.']]);
        }

        return DB::transaction(function () use ($user, $template, $points, $method) {
            $purchase = TemplatePurchase::updateOrCreate(
                ['user_id' => $user->id, 'template_id' => $template->id],
                [
                    'unlock_method' => $method,
                    'amount'        => 0,
                    'currency'      => $template->currency,
                    'points_spent'  => $points,
                    'status'        => TemplatePurchaseStatus::Completed,
                    'paid_at'       => now(),
                ],
            );

            // Throws (and rolls back) if the wallet is short.
            $this->rewards->debit(
                $user,
                RewardSource::TemplateRedemption,
                $points,
                "Unlocked template: {$template->name}",
                $purchase,
            );

            $template->increment('purchases_count');

            return $purchase->refresh();
        });
    }

    /**
     * Create a pending purchase + Razorpay order. For "mixed", reserve as many
     * wallet points as allowed and only charge the remaining money balance.
     */
    private function startMoneyCheckout(User $user, Template $template, bool $mixed): array
    {
        if (! $template->hasMoneyPrice()) {
            throw ValidationException::withMessages(['method' => ['This template has no money price.']]);
        }

        $amount = (float) $template->price;
        $pointsToSpend = 0;

        if ($mixed) {
            $rate = max(1, RewardSetting::points('points_to_inr_rate', 1)); // points per ₹1
            $maxByTemplate = $template->hasPointsPrice() ? (int) $template->price_points : (int) round($amount * $rate);
            $pointsToSpend = min($this->rewards->balance($user), $maxByTemplate);
            $discount = $pointsToSpend / $rate;
            $amount = max(0, round($amount - $discount, 2));
        }

        // Points fully cover the price — settle immediately, no payment needed.
        if ($amount <= 0) {
            return [
                'status' => 'completed',
                'purchase' => $this->completeWithPoints($user, $template, $pointsToSpend, TemplateUnlockMethod::Mixed),
                'requires_payment' => false,
            ];
        }

        $purchase = TemplatePurchase::updateOrCreate(
            ['user_id' => $user->id, 'template_id' => $template->id],
            [
                'unlock_method'  => $mixed ? TemplateUnlockMethod::Mixed : TemplateUnlockMethod::Money,
                'amount'         => $amount,
                'currency'       => $template->currency,
                'points_spent'   => $pointsToSpend,
                'status'         => TemplatePurchaseStatus::Pending,
                'transaction_id' => 'TPL-'.strtoupper(Str::random(14)),
            ],
        );

        $order = $this->razorpay->createOrder($amount, $template->currency, $purchase->transaction_id);
        $purchase->update(['razorpay_order_id' => $order['id']]);

        return [
            'status'           => 'pending',
            'purchase'         => $purchase->refresh(),
            'order'            => $order,
            'razorpay_key'     => config('services.razorpay.key'),
            'requires_payment' => true,
        ];
    }
}
