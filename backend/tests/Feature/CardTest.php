<?php

use App\Models\Card;
use App\Models\User;
use Database\Seeders\SubscriptionPlanSeeder;

beforeEach(function () {
    $this->seed(SubscriptionPlanSeeder::class);
});

function actingUser(): array
{
    $user = User::factory()->create();
    $token = auth('api')->login($user);

    return [$user, $token];
}

it('creates a card with a unique slug', function () {
    [$user, $token] = actingUser();

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/cards', [
            'full_name' => 'John Doe',
            'designation' => 'Founder',
        ]);

    $response->assertCreated()
        ->assertJsonPath('data.full_name', 'John Doe')
        ->assertJsonPath('data.slug', 'john-doe')
        ->assertJsonPath('data.is_default', true);

    $this->assertDatabaseHas('cards', ['user_id' => $user->id, 'slug' => 'john-doe']);
});

it('lists the user\'s cards including published ones', function () {
    [$user, $token] = actingUser();
    Card::factory()->for($user)->create(['is_published' => true]);

    $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/cards')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

it('filters cards by published state when requested', function () {
    [$user, $token] = actingUser();
    Card::factory()->for($user)->create(['is_published' => true]);
    Card::factory()->for($user)->create(['is_published' => false]);

    $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/cards?is_published=0')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

it('enforces the free plan single-card limit', function () {
    [$user, $token] = actingUser();
    Card::factory()->for($user)->create();

    $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/cards', ['full_name' => 'Second Card'])
        ->assertStatus(422)
        ->assertJsonValidationErrors('plan');
});

it('prevents viewing another users card', function () {
    [, $token] = actingUser();
    $otherCard = Card::factory()->create();

    $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson("/api/v1/cards/{$otherCard->id}")
        ->assertForbidden();
});

it('updates an owned card', function () {
    [$user, $token] = actingUser();
    $card = Card::factory()->for($user)->create();

    $this->withHeader('Authorization', "Bearer {$token}")
        ->putJson("/api/v1/cards/{$card->id}", ['designation' => 'CEO'])
        ->assertOk()
        ->assertJsonPath('data.designation', 'CEO');
});

it('deletes an owned card', function () {
    [$user, $token] = actingUser();
    $card = Card::factory()->for($user)->create();

    $this->withHeader('Authorization', "Bearer {$token}")
        ->deleteJson("/api/v1/cards/{$card->id}")
        ->assertOk();

    $this->assertSoftDeleted('cards', ['id' => $card->id]);
});

it('returns a QR code for an owned card', function () {
    [$user, $token] = actingUser();
    $card = Card::factory()->for($user)->create();

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->get("/api/v1/cards/{$card->id}/qr");

    $response->assertOk();
    expect($response->headers->get('Content-Type'))->toContain('svg');
});

it('adds a social link to an owned card', function () {
    [$user, $token] = actingUser();
    $card = Card::factory()->for($user)->create();

    $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson("/api/v1/cards/{$card->id}/social-links", [
            'platform' => 'linkedin',
            'url' => 'https://linkedin.com/in/johndoe',
        ])->assertCreated()
        ->assertJsonPath('data.platform', 'linkedin');
});
