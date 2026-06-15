<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            ['key' => 'maintenance_mode', 'value' => '0', 'type' => 'bool', 'group' => 'general'],
            ['key' => 'signups_enabled', 'value' => '1', 'type' => 'bool', 'group' => 'general'],
            ['key' => 'app_name', 'value' => 'DCard', 'type' => 'string', 'group' => 'general'],
            ['key' => 'support_email', 'value' => 'info@copg.in', 'type' => 'string', 'group' => 'support'],
            ['key' => 'support_url', 'value' => 'https://dcard.app/help', 'type' => 'string', 'group' => 'support'],
            ['key' => 'announcement_banner', 'value' => null, 'type' => 'string', 'group' => 'general'],

            // Ads — only free users ever see ads (enforced in AdService).
            ['key' => 'ads_enabled', 'value' => '1', 'type' => 'bool', 'group' => 'ads'],
            ['key' => 'admob_enabled', 'value' => '0', 'type' => 'bool', 'group' => 'ads'],
            ['key' => 'admob_android_banner_id', 'value' => null, 'type' => 'string', 'group' => 'ads'],
            ['key' => 'admob_ios_banner_id', 'value' => null, 'type' => 'string', 'group' => 'ads'],
        ];

        foreach ($defaults as $setting) {
            Setting::firstOrCreate(['key' => $setting['key']], $setting);
        }

        Setting::flush();
    }
}
