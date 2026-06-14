<?php

namespace Database\Factories;

use App\Enums\AnalyticsEventType;
use App\Models\AnalyticsEvent;
use App\Models\Card;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AnalyticsEvent>
 */
class AnalyticsEventFactory extends Factory
{
    protected $model = AnalyticsEvent::class;

    public function definition(): array
    {
        return [
            'card_id' => Card::factory(),
            'type' => fake()->randomElement(AnalyticsEventType::cases()),
            'visitor_hash' => hash('sha256', fake()->uuid()),
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
            'created_at' => now(),
        ];
    }

    public function ofType(AnalyticsEventType $type): static
    {
        return $this->state(fn () => ['type' => $type]);
    }
}
