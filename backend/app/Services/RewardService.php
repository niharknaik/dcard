<?php

namespace App\Services;

use App\Enums\RewardSource;
use App\Enums\RewardTransactionType;
use App\Models\RewardSetting;
use App\Models\RewardTransaction;
use App\Models\RewardWallet;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Owns the reward-points wallet: crediting (referrals, bonuses, admin) and
 * debiting (template redemption, redeem). Every mutation writes a ledger row.
 */
class RewardService
{
    /** Get (or lazily create) the user's wallet. */
    public function walletFor(User $user): RewardWallet
    {
        return RewardWallet::firstOrCreate(['user_id' => $user->id]);
    }

    public function balance(User $user): int
    {
        return (int) $this->walletFor($user)->balance;
    }

    public function credit(
        User $user,
        RewardSource $source,
        int $points,
        ?string $description = null,
        ?Model $reference = null,
        array $meta = [],
    ): RewardTransaction {
        return $this->record($user, RewardTransactionType::Credit, $source, abs($points), $description, $reference, $meta);
    }

    public function debit(
        User $user,
        RewardSource $source,
        int $points,
        ?string $description = null,
        ?Model $reference = null,
        array $meta = [],
    ): RewardTransaction {
        return $this->record($user, RewardTransactionType::Debit, $source, abs($points), $description, $reference, $meta);
    }

    /** Redeem points (cash-out / generic spend), honouring the minimum-redeem rule. */
    public function redeem(User $user, int $points, ?string $description = null): RewardTransaction
    {
        if ($points <= 0) {
            throw ValidationException::withMessages(['points' => ['Enter a number of points greater than zero.']]);
        }

        $min = RewardSetting::points('min_redeem_points', 0);
        if ($min > 0 && $points < $min) {
            throw ValidationException::withMessages(['points' => ["You must redeem at least {$min} points."]]);
        }

        return $this->debit($user, RewardSource::Adjustment, $points, $description ?? 'Points redeemed');
    }

    public function history(User $user, int $perPage = 20): LengthAwarePaginator
    {
        return $this->walletFor($user)
            ->transactions()
            ->paginate($perPage);
    }

    /**
     * Atomically apply a points movement and append a ledger row.
     * `$points` is always a positive magnitude; `$type` decides the direction.
     */
    private function record(
        User $user,
        RewardTransactionType $type,
        RewardSource $source,
        int $points,
        ?string $description,
        ?Model $reference,
        array $meta,
    ): RewardTransaction {
        if ($points <= 0) {
            throw ValidationException::withMessages(['points' => ['Points must be greater than zero.']]);
        }

        return DB::transaction(function () use ($user, $type, $source, $points, $description, $reference, $meta) {
            $wallet = RewardWallet::where('user_id', $user->id)->lockForUpdate()->first()
                ?? RewardWallet::create(['user_id' => $user->id]);

            if ($type === RewardTransactionType::Debit && $wallet->balance < $points) {
                throw ValidationException::withMessages([
                    'points' => ['Insufficient reward points. Your balance is '.$wallet->balance.'.'],
                ]);
            }

            if ($type === RewardTransactionType::Credit) {
                $wallet->balance += $points;
                $wallet->lifetime_earned += $points;
            } else {
                $wallet->balance -= $points;
                $wallet->lifetime_redeemed += $points;
            }
            $wallet->save();

            return $wallet->transactions()->create([
                'user_id'        => $user->id,
                'type'           => $type,
                'source'         => $source,
                'points'         => $points,
                'balance_after'  => $wallet->balance,
                'description'    => $description,
                'reference_type' => $reference?->getMorphClass(),
                'reference_id'   => $reference?->getKey(),
                'meta'           => $meta ?: null,
            ]);
        });
    }
}
