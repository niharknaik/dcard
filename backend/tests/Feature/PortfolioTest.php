<?php

use App\Enums\SubscriptionStatus;
use App\Models\Card;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Database\Seeders\SubscriptionPlanSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed(SubscriptionPlanSeeder::class);
    Storage::fake('public');
});

function premiumUser(): User
{
    $user = User::factory()->create();
    $plan = SubscriptionPlan::where('code', 'premium')->first();
    Subscription::create([
        'user_id' => $user->id,
        'subscription_plan_id' => $plan->id,
        'status' => SubscriptionStatus::Active,
        'starts_at' => now()->subDay(),
        'ends_at' => now()->addMonth(),
    ]);

    return $user;
}

it('blocks portfolio uploads on the free plan', function () {
    $user = User::factory()->create();
    $token = auth('api')->login($user);
    $card = Card::factory()->for($user)->create();

    $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson("/api/v1/cards/{$card->id}/portfolio", [
            'title' => 'My Work',
            'type' => 'image',
            'media' => UploadedFile::fake()->image('work.jpg'),
        ])->assertForbidden();
});

it('allows portfolio uploads on the premium plan', function () {
    $user = premiumUser();
    $token = auth('api')->login($user);
    $card = Card::factory()->for($user)->create();

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->post("/api/v1/cards/{$card->id}/portfolio", [
            'title' => 'My Work',
            'type' => 'image',
            'media' => UploadedFile::fake()->image('work.jpg', 600, 400),
        ]);

    $response->assertCreated()->assertJsonPath('data.title', 'My Work');
    $this->assertDatabaseHas('portfolio_items', ['card_id' => $card->id, 'title' => 'My Work']);
});

it('rejects a non-image file declared as an image', function () {
    $user = premiumUser();
    $token = auth('api')->login($user);
    $card = Card::factory()->for($user)->create();

    $this->withHeader('Authorization', "Bearer {$token}")
        ->post("/api/v1/cards/{$card->id}/portfolio", [
            'title' => 'Bad',
            'type' => 'image',
            'media' => UploadedFile::fake()->create('malware.pdf', 100, 'application/pdf'),
        ])->assertStatus(422)->assertJsonValidationErrors('media');
});
