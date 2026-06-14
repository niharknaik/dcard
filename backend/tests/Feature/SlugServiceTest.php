<?php

use App\Models\Card;
use App\Services\SlugService;

it('generates a slug from a value', function () {
    expect(app(SlugService::class)->unique('John Doe'))->toBe('john-doe');
});

it('appends an incrementing suffix on collision', function () {
    Card::factory()->create(['slug' => 'john-doe']);
    Card::factory()->create(['slug' => 'john-doe-2']);

    expect(app(SlugService::class)->unique('John Doe'))->toBe('john-doe-3');
});

it('ignores the current record when checking uniqueness', function () {
    $card = Card::factory()->create(['slug' => 'john-doe']);

    expect(app(SlugService::class)->unique('John Doe', ignoreId: $card->id))->toBe('john-doe');
});

it('falls back to a random slug for empty input', function () {
    expect(app(SlugService::class)->unique('!!!'))->not->toBe('');
});
