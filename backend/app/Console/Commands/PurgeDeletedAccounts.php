<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\UserService;
use Illuminate\Console\Command;

class PurgeDeletedAccounts extends Command
{
    protected $signature = 'accounts:purge {--grace-days=30 : Days after soft-deletion before PII is permanently erased}';

    protected $description = 'Permanently erase/anonymize PII for accounts past their right-to-erasure grace window';

    public function handle(UserService $users): int
    {
        $graceDays = (int) $this->option('grace-days');
        $cutoff = now()->subDays($graceDays);
        $purged = 0;

        User::onlyTrashed()
            ->whereNull('anonymized_at')
            ->where('deleted_at', '<=', $cutoff)
            ->chunkById(100, function ($batch) use ($users, &$purged) {
                foreach ($batch as $user) {
                    $users->purgeAccount($user);
                    $purged++;
                }
            });

        $this->info("Purged: {$purged}.");

        return self::SUCCESS;
    }
}
