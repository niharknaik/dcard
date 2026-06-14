<?php

namespace App\Filament\Widgets;

use App\Enums\RewardTransactionType;
use App\Enums\TemplatePurchaseStatus;
use App\Models\Referral;
use App\Models\RewardTransaction;
use App\Models\Template;
use App\Models\TemplatePurchase;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class MarketplaceStatsWidget extends BaseWidget
{
    protected static ?int $sort = 4;

    protected function getStats(): array
    {
        $completed = TemplatePurchase::where('status', TemplatePurchaseStatus::Completed->value);

        $templateRevenue = (float) (clone $completed)->sum('amount');
        $unlocks = (clone $completed)->count();

        $pointsDistributed = (int) RewardTransaction::where('type', RewardTransactionType::Credit->value)->sum('points');
        $pointsRedeemed = (int) RewardTransaction::where('type', RewardTransactionType::Debit->value)->sum('points');

        return [
            Stat::make('Active Templates', Template::where('is_active', true)->count())
                ->description('Total in marketplace: '.Template::count())
                ->color('primary'),
            Stat::make('Template Unlocks', $unlocks)
                ->description('All-time completed')
                ->color('success'),
            Stat::make('Template Revenue', '₹'.number_format($templateRevenue, 2))
                ->color('success'),
            Stat::make('Points Distributed', number_format($pointsDistributed))
                ->color('warning'),
            Stat::make('Points Redeemed', number_format($pointsRedeemed))
                ->color('danger'),
            Stat::make('Total Referrals', Referral::count())
                ->description('Rewarded: '.Referral::where('status', 'rewarded')->count())
                ->color('primary'),
        ];
    }
}
