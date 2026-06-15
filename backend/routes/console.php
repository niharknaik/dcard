<?php

use Illuminate\Support\Facades\Schedule;

/*
|--------------------------------------------------------------------------
| Scheduled tasks
|--------------------------------------------------------------------------
| Commands are registered in later phases:
|  - analytics:aggregate     (nightly daily rollup)            Phase 4
|  - subscriptions:check     (expiry reminders + expirations)  Phase 5
|  - accounts:purge          (erase PII past 30-day grace)     Phase 6
*/

Schedule::command('analytics:aggregate')->dailyAt('00:15');
Schedule::command('subscriptions:check')->dailyAt('06:00');
Schedule::command('accounts:purge')->dailyAt('02:00');
