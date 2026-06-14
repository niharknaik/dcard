<?php

namespace App\Console\Commands;

use App\Services\SubscriptionService;
use Illuminate\Console\Command;

class CheckSubscriptions extends Command
{
    protected $signature = 'subscriptions:check {--reminder-days=3 : Days ahead to send expiry reminders}';

    protected $description = 'Expire overdue subscriptions and send expiry reminders';

    public function handle(SubscriptionService $subscriptions): int
    {
        $expired = $subscriptions->expireOverdue();
        $reminded = $subscriptions->sendExpiryReminders((int) $this->option('reminder-days'));

        $this->info("Expired: {$expired}. Reminders sent: {$reminded}.");

        return self::SUCCESS;
    }
}
