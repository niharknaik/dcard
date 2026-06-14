<?php

use App\Enums\SubscriptionStatus;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\SubscriptionPlanSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->seed(SubscriptionPlanSeeder::class);
});

function businessUser(): User
{
    $user = User::factory()->create();
    $plan = SubscriptionPlan::where('code', 'business')->first();
    Subscription::create([
        'user_id' => $user->id,
        'subscription_plan_id' => $plan->id,
        'status' => SubscriptionStatus::Active,
        'starts_at' => now()->subDay(),
        'ends_at' => now()->addMonth(),
    ]);

    return $user;
}

it('blocks team management for non-business plans', function () {
    $token = auth('api')->login(User::factory()->create());

    $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/team/members')
        ->assertForbidden();
});

it('lets a business user add an employee', function () {
    $owner = businessUser();
    $token = auth('api')->login($owner);

    $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/team/members', [
            'name' => 'Employee One',
            'email' => 'employee1@example.com',
            'password' => 'Secret@123',
            'password_confirmation' => 'Secret@123',
            'position' => 'Sales',
        ])->assertCreated()
        ->assertJsonPath('data.user.email', 'employee1@example.com');

    $this->assertDatabaseHas('users', ['email' => 'employee1@example.com']);
    $this->assertDatabaseHas('team_members', ['position' => 'Sales']);
});

it('returns team analytics for a business user', function () {
    $owner = businessUser();
    $token = auth('api')->login($owner);

    $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/team/analytics')
        ->assertOk()
        ->assertJsonStructure(['data' => ['team', 'members', 'cards', 'totals']]);
});
