<?php

namespace App\Filament\Widgets;

use App\Enums\PaymentStatus;
use App\Enums\SubscriptionStatus;
use App\Models\Card;
use App\Models\Lead;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverviewWidget extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $revenue = (float) Payment::where('status', PaymentStatus::Paid->value)->sum('amount');

        $byPlan = Subscription::query()
            ->where('subscriptions.status', SubscriptionStatus::Active->value)
            ->join('subscription_plans', 'subscription_plans.id', '=', 'subscriptions.subscription_plan_id')
            ->selectRaw('subscription_plans.code as code, COUNT(*) as total')
            ->groupBy('subscription_plans.code')
            ->pluck('total', 'code');

        return [
            Stat::make('Total Users', User::count())
                ->description('Active: '.User::where('status', 'active')->count())
                ->color('primary'),
            Stat::make('Premium Users', (int) ($byPlan['premium'] ?? 0))
                ->color('success'),
            Stat::make('Business Users', (int) ($byPlan['business'] ?? 0))
                ->color('warning'),
            Stat::make('Revenue', '₹'.number_format($revenue, 2))
                ->description('All-time paid')
                ->color('success'),
            Stat::make('Active Subscriptions', Subscription::where('status', SubscriptionStatus::Active->value)->count()),
            Stat::make('Expired Subscriptions', Subscription::where('status', SubscriptionStatus::Expired->value)->count()),
            Stat::make('Total Cards', Card::count()),
            Stat::make('Total Leads', Lead::count()),
        ];
    }
}
