<?php

namespace App\Filament\Widgets;

use App\Models\Referral;
use Filament\Widgets\ChartWidget;

class ReferralGrowthChartWidget extends ChartWidget
{
    protected static ?string $heading = 'Referral growth — last 12 months';

    protected static ?int $sort = 6;

    protected function getData(): array
    {
        $labels = [];
        $values = [];

        for ($i = 11; $i >= 0; $i--) {
            $month = now()->startOfMonth()->subMonths($i);
            $labels[] = $month->format('M Y');
            $values[] = Referral::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();
        }

        return [
            'datasets' => [[
                'label' => 'Referrals',
                'data' => $values,
                'borderColor' => '#8b5cf6',
                'backgroundColor' => 'rgba(139, 92, 246, 0.12)',
                'fill' => true,
            ]],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
