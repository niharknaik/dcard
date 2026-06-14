<?php

namespace App\Filament\Widgets;

use App\Models\Template;
use Filament\Widgets\ChartWidget;

class TopTemplatesChartWidget extends ChartWidget
{
    protected static ?string $heading = 'Most purchased templates';

    protected static ?int $sort = 5;

    protected function getData(): array
    {
        $templates = Template::query()
            ->orderByDesc('purchases_count')
            ->limit(8)
            ->get(['name', 'purchases_count']);

        return [
            'datasets' => [[
                'label' => 'Unlocks',
                'data' => $templates->pluck('purchases_count')->all(),
                'backgroundColor' => '#6366f1',
            ]],
            'labels' => $templates->pluck('name')->all(),
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }
}
