<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Free',
                'slug' => 'free',
                'code' => 'free',
                'description' => '1 card, basic template, limited analytics.',
                'price' => 0,
                'billing_period' => 'lifetime',
                'card_limit' => 1,
                'allow_portfolio' => false,
                'allow_leads' => false,
                'allow_team' => false,
                'features' => ['1 Card', 'Basic Template', 'Limited Analytics'],
                'sort_order' => 1,
            ],
            [
                'name' => 'Premium',
                'slug' => 'premium',
                'code' => 'premium',
                'description' => 'Unlimited cards, premium templates, portfolio, analytics, leads.',
                'price' => 299,
                'billing_period' => 'monthly',
                'card_limit' => 0,
                'allow_portfolio' => true,
                'allow_leads' => true,
                'allow_team' => false,
                'features' => ['Unlimited Cards', 'Premium Templates', 'Portfolio Uploads', 'Analytics', 'Lead Collection'],
                'sort_order' => 2,
            ],
            [
                'name' => 'Business',
                'slug' => 'business',
                'code' => 'business',
                'description' => 'Everything in Premium plus team management & advanced analytics.',
                'price' => 999,
                'billing_period' => 'monthly',
                'card_limit' => 0,
                'allow_portfolio' => true,
                'allow_leads' => true,
                'allow_team' => true,
                'features' => ['Team Management', 'Employee Cards', 'Advanced Analytics'],
                'sort_order' => 3,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(['code' => $plan['code']], $plan);
        }
    }
}
