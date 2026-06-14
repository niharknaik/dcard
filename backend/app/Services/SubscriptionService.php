<?php

namespace App\Services;

use App\Enums\NotificationType;
use App\Enums\PlanCode;
use App\Enums\SubscriptionStatus;
use App\Mail\SubscriptionActivatedMail;
use App\Mail\SubscriptionExpiryMail;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

/**
 * Resolves a user's effective plan, enforces plan-based capability limits, and
 * manages the subscription lifecycle (activation, expiry, reminders).
 */
class SubscriptionService
{
    public function __construct(private readonly NotificationService $notifications) {}

    /** The user's active plan, falling back to the Free plan. */
    public function currentPlan(User $user): SubscriptionPlan
    {
        $subscription = $user->subscriptions()
            ->where('status', SubscriptionStatus::Active->value)
            ->with('plan')
            ->latest('starts_at')
            ->first();

        if ($subscription && $subscription->isActive() && $subscription->plan) {
            return $subscription->plan;
        }

        return SubscriptionPlan::where('code', PlanCode::Free->value)->firstOrFail();
    }

    public function canCreateCard(User $user): bool
    {
        $plan = $this->currentPlan($user);

        if ($plan->isUnlimitedCards()) {
            return true;
        }

        return $user->cards()->count() < $plan->card_limit;
    }

    public function cardLimit(User $user): int
    {
        return $this->currentPlan($user)->card_limit;
    }

    public function allows(User $user, string $capability): bool
    {
        $plan = $this->currentPlan($user);

        return match ($capability) {
            'portfolio' => (bool) $plan->allow_portfolio,
            'leads' => (bool) $plan->allow_leads,
            'team' => (bool) $plan->allow_team,
            default => false,
        };
    }

    /**
     * Activate a plan for a user: supersede any current active subscription and
     * create a fresh active one with a validity window derived from the plan.
     */
    public function activate(User $user, SubscriptionPlan $plan): Subscription
    {
        return DB::transaction(function () use ($user, $plan) {
            $user->subscriptions()
                ->where('status', SubscriptionStatus::Active->value)
                ->update(['status' => SubscriptionStatus::Cancelled->value, 'cancelled_at' => now()]);

            $subscription = $user->subscriptions()->create([
                'subscription_plan_id' => $plan->id,
                'status' => SubscriptionStatus::Active,
                'starts_at' => now(),
                'ends_at' => $this->endDateFor($plan),
                'auto_renew' => false,
                'expiry_reminder_sent' => false,
            ]);

            $this->notifications->send(
                $user,
                NotificationType::SubscriptionActivated,
                'Subscription activated',
                "Your {$plan->name} plan is now active. Enjoy!",
                ['plan' => $plan->code, 'subscription_id' => $subscription->id],
            );

            if ($user->email) {
                Mail::to($user->email)->queue(new SubscriptionActivatedMail($user, $plan, $subscription));
            }

            return $subscription;
        });
    }

    public function endDateFor(SubscriptionPlan $plan): ?Carbon
    {
        return match ($plan->billing_period) {
            'monthly' => now()->addMonth(),
            'yearly' => now()->addYear(),
            default => null, // lifetime
        };
    }

    /**
     * Expire active subscriptions whose window has passed. Returns the count.
     */
    public function expireOverdue(): int
    {
        $count = 0;

        Subscription::query()
            ->where('status', SubscriptionStatus::Active->value)
            ->whereNotNull('ends_at')
            ->where('ends_at', '<', now())
            ->with('user')
            ->chunkById(200, function ($subscriptions) use (&$count) {
                foreach ($subscriptions as $subscription) {
                    $subscription->update(['status' => SubscriptionStatus::Expired]);

                    if ($subscription->user) {
                        $this->notifications->send(
                            $subscription->user,
                            NotificationType::SubscriptionExpiring,
                            'Subscription expired',
                            'Your subscription has expired. Renew to keep premium features.',
                            ['subscription_id' => $subscription->id],
                        );
                    }
                    $count++;
                }
            });

        return $count;
    }

    /**
     * Notify users whose subscription expires within $days (once).
     */
    public function sendExpiryReminders(int $days = 3): int
    {
        $count = 0;

        Subscription::query()
            ->expiringWithin($days)
            ->where('expiry_reminder_sent', false)
            ->with(['user', 'plan'])
            ->chunkById(200, function ($subscriptions) use (&$count) {
                foreach ($subscriptions as $subscription) {
                    $user = $subscription->user;
                    if (! $user) {
                        continue;
                    }

                    $this->notifications->send(
                        $user,
                        NotificationType::SubscriptionExpiring,
                        'Subscription expiring soon',
                        "Your {$subscription->plan?->name} plan expires on {$subscription->ends_at?->toFormattedDateString()}.",
                        ['subscription_id' => $subscription->id, 'ends_at' => $subscription->ends_at?->toIso8601String()],
                    );

                    if ($user->email) {
                        Mail::to($user->email)->queue(new SubscriptionExpiryMail($user, $subscription));
                    }

                    $subscription->update(['expiry_reminder_sent' => true]);
                    $count++;
                }
            });

        return $count;
    }
}
