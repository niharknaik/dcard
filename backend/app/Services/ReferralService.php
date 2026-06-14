<?php

namespace App\Services;

use App\Enums\RewardSource;
use App\Models\Referral;
use App\Models\RewardSetting;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Issues per-user referral codes/links and rewards referrers when an invited
 * user signs up. Reward amounts are driven entirely by RewardSetting.
 */
class ReferralService
{
    public function __construct(private readonly RewardService $rewards) {}

    /** Ensure the user has a referral code, generating one on first access. */
    public function ensureCode(User $user): string
    {
        if (! empty($user->referral_code)) {
            return $user->referral_code;
        }

        $code = $this->generateUniqueCode();
        $user->forceFill(['referral_code' => $code])->save();

        return $code;
    }

    public function referralLink(User $user): string
    {
        $base = rtrim(config('app.referral_base_url', config('app.url')), '/');

        return $base.'/ref/'.$this->ensureCode($user);
    }

    public function resolveReferrer(?string $code): ?User
    {
        $code = trim((string) $code);
        if ($code === '') {
            return null;
        }

        return User::where('referral_code', $code)->first();
    }

    /**
     * Link a freshly-registered user to their referrer and reward the referrer.
     * Safe no-op when the code is missing/invalid or self-referral.
     */
    public function attachReferral(User $newUser, ?string $code): ?Referral
    {
        $referrer = $this->resolveReferrer($code);

        if (! $referrer || $referrer->id === $newUser->id) {
            return null;
        }

        if (Referral::where('referred_id', $newUser->id)->exists()) {
            return null;
        }

        $points = RewardSetting::points('referral_reward_points', 50);

        return DB::transaction(function () use ($newUser, $referrer, $points) {
            $newUser->forceFill(['referred_by' => $referrer->id])->save();

            $referral = Referral::create([
                'referrer_id'    => $referrer->id,
                'referred_id'    => $newUser->id,
                'referral_code'  => $referrer->referral_code,
                'points_awarded' => $points,
                'status'         => $points > 0 ? 'rewarded' : 'pending',
                'rewarded_at'    => $points > 0 ? now() : null,
            ]);

            if ($points > 0) {
                $this->rewards->credit(
                    $referrer,
                    RewardSource::Referral,
                    $points,
                    "Referral reward — {$newUser->name} joined using your code",
                    $referral,
                );
            }

            return $referral;
        });
    }

    /** Optional signup bonus credited to a new user. */
    public function awardSignupBonus(User $user): void
    {
        $bonus = RewardSetting::points('signup_bonus_points', 0);
        if ($bonus > 0) {
            $this->rewards->credit($user, RewardSource::SignupBonus, $bonus, 'Welcome signup bonus');
        }
    }

    /** Referral dashboard payload: code, link, totals and the referral list. */
    public function dashboard(User $user): array
    {
        $this->ensureCode($user);

        $referrals = $user->referralsMade()
            ->with('referred:id,name,email,created_at')
            ->latest()
            ->get();

        return [
            'referral_code'       => $user->referral_code,
            'referral_link'       => $this->referralLink($user),
            'total_referrals'     => $referrals->count(),
            'total_points_earned' => (int) $referrals->sum('points_awarded'),
            'referrals'           => $referrals,
        ];
    }

    private function generateUniqueCode(): string
    {
        do {
            $code = 'DC'.strtoupper(Str::random(6));
        } while (User::where('referral_code', $code)->exists());

        return $code;
    }
}
