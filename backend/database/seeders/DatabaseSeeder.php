<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            SubscriptionPlanSeeder::class,
            AdminUserSeeder::class,
            SettingSeeder::class,
            TemplateCategorySeeder::class,
            TemplateSeeder::class,
            RewardSettingSeeder::class,
        ]);
    }
}
