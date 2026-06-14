<?php

namespace App\Filament\Widgets;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class RevenueChartWidget extends ChartWidget
{
    protected static ?string $heading = 'Revenue — last 12 months';

    protected static ?int $sort = 2;

    protected function getData(): array
    {
        $labels = [];
        $values = [];

        for ($i = 11; $i >= 0; $i--) {
            $month = now()->startOfMonth()->subMonths($i);
            $labels[] = $month->format('M Y');
            $values[] = (float) Payment::where('status', PaymentStatus::Paid->value)
                ->whereYear('paid_at', $month->year)
                ->whereMonth('paid_at', $month->month)
                ->sum('amount');
        }

        return [
            'datasets' => [[
                'label' => 'Revenue (₹)',
                'data' => $values,
                'borderColor' => '#4f46e5',
                'backgroundColor' => 'rgba(79, 70, 229, 0.1)',
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
