<?php

use App\Models\Card;

it('returns a published card by slug and increments views', function () {
    $card = Card::factory()->create(['slug' => 'jane-smith', 'views_count' => 0]);

    $this->getJson('/api/v1/public/cards/jane-smith')
        ->assertOk()
        ->assertJsonPath('data.slug', 'jane-smith')
        ->assertJsonPath('data.full_name', $card->full_name)
        ->assertJsonMissingPath('data.user_id');

    expect($card->fresh()->views_count)->toBe(1);
});

it('returns 404 for an unpublished card', function () {
    Card::factory()->unpublished()->create(['slug' => 'hidden-card']);

    $this->getJson('/api/v1/public/cards/hidden-card')->assertNotFound();
});

it('returns 404 for a missing slug', function () {
    $this->getJson('/api/v1/public/cards/does-not-exist')->assertNotFound();
});
