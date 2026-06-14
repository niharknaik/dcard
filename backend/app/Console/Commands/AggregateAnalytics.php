<?php

namespace App\Console\Commands;

use App\Services\AnalyticsService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class AggregateAnalytics extends Command
{
    protected $signature = 'analytics:aggregate {date? : Y-m-d date to aggregate (defaults to yesterday)}';

    protected $description = 'Roll up raw analytics events into the daily aggregate table';

    public function handle(AnalyticsService $analytics): int
    {
        $date = $this->argument('date')
            ? Carbon::parse($this->argument('date'))
            : now()->subDay();

        $count = $analytics->aggregateForDate($date);

        $this->info("Aggregated analytics for {$date->toDateString()}: {$count} card(s).");

        return self::SUCCESS;
    }
}
