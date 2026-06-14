<?php

namespace App\Filament\Widgets;

use App\Models\User;
use Filament\Widgets\ChartWidget;

class UserGrowthChartWidget extends ChartWidget
{
    protected static ?string $heading = 'New users — last 12 months';

    protected static ?int $sort = 3;

    protected function getData(): array
    {
        $labels = [];
        $values = [];

        for ($i = 11; $i >= 0; $i--) {
            $month = now()->startOfMonth()->subMonths($i);
            $labels[] = $month->format('M Y');
            $values[] = User::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();
        }

        return [
            'datasets' => [[
                'label' => 'New users',
                'data' => $values,
                'backgroundColor' => '#10b981',
            ]],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }
}
