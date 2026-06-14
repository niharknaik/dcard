<?php

namespace Database\Seeders;

use App\Models\RewardSetting;
use Illuminate\Database\Seeder;

class RewardSettingSeeder extends Seeder
{
    public function run(): void
    {
        // key, value, type, group, label
        $settings = [
            ['referral_reward_points', 50, 'int', 'referral', 'Referral Reward Points'],
            ['signup_bonus_points', 0, 'int', 'signup', 'Signup Bonus Points'],
            ['promotional_reward_points', 0, 'int', 'promotional', 'Promotional Reward Points'],
            ['min_redeem_points', 100, 'int', 'redemption', 'Minimum Points To Redeem'],
            ['points_to_inr_rate', 1, 'int', 'redemption', 'Points per ₹1 (template money+points unlocks)'],
            ['rewards_enabled', 1, 'bool', 'general', 'Rewards System Enabled'],
        ];

        foreach ($settings as [$key, $value, $type, $group, $label]) {
            // Preserve admin-edited values; only create missing keys.
            if (! RewardSetting::where('key', $key)->exists()) {
                RewardSetting::set($key, $value, $type, $group, $label);
            }
        }
    }
}
