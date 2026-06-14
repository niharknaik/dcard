<?php

use App\Enums\AnalyticsEventType;
use App\Models\AnalyticsEvent;
use App\Models\Card;
use App\Models\User;
use App\Services\AnalyticsService;

it('records a public interaction event', function () {
    $card = Card::factory()->create(['slug' => 'acme-co']);

    $this->postJson('/api/v1/public/cards/acme-co/events', [
        'type' => 'qr_scan',
        'metadata' => ['platform' => 'qr'],
    ])->assertOk();

    $this->assertDatabaseHas('analytics_events', ['card_id' => $card->id, 'type' => 'qr_scan']);
});

it('rejects recording a view via the events endpoint', function () {
    Card::factory()->create(['slug' => 'acme-co']);

    $this->postJson('/api/v1/public/cards/acme-co/events', ['type' => 'view'])
        ->assertStatus(422)
        ->assertJsonValidationErrors('type');
});

it('increments views and records a view event on public fetch', function () {
    $card = Card::factory()->create(['slug' => 'acme-co', 'views_count' => 0]);

    $this->getJson('/api/v1/public/cards/acme-co')->assertOk();

    expect($card->fresh()->views_count)->toBe(1);
    $this->assertDatabaseHas('analytics_events', ['card_id' => $card->id, 'type' => 'view']);
});

it('sends a milestone notification when views cross a threshold', function () {
    $owner = User::factory()->create();
    $card = Card::factory()->for($owner)->create(['slug' => 'acme-co', 'views_count' => 99]);

    $this->getJson('/api/v1/public/cards/acme-co')->assertOk();

    $this->assertDatabaseHas('notifications', ['user_id' => $owner->id, 'type' => 'view_milestone']);
});

it('aggregates raw events into the daily table', function () {
    $card = Card::factory()->create();
    AnalyticsEvent::factory()->for($card)->ofType(AnalyticsEventType::View)->count(3)
        ->create(['visitor_hash' => 'visitor-a', 'created_at' => now()]);
    AnalyticsEvent::factory()->for($card)->ofType(AnalyticsEventType::QrScan)->count(2)
        ->create(['created_at' => now()]);

    app(AnalyticsService::class)->aggregateForDate(now());

    $this->assertDatabaseHas('card_analytics_daily', [
        'card_id' => $card->id,
        'views' => 3,
        'unique_visitors' => 1,
        'qr_scans' => 2,
    ]);
});

it('returns an account-wide analytics summary', function () {
    $owner = User::factory()->create();
    $token = auth('api')->login($owner);
    Card::factory()->for($owner)->create();

    $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/analytics/summary?period=daily')
        ->assertOk()
        ->assertJsonStructure(['data' => ['period', 'totals', 'series']]);
});
