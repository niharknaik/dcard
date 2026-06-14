<?php

namespace Database\Factories;

use App\Enums\SocialPlatform;
use App\Models\Card;
use App\Models\SocialLink;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SocialLink>
 */
class SocialLinkFactory extends Factory
{
    protected $model = SocialLink::class;

    public function definition(): array
    {
        return [
            'card_id' => Card::factory(),
            'platform' => fake()->randomElement(SocialPlatform::values()),
            'url' => fake()->url(),
            'label' => null,
            'sort_order' => fake()->numberBetween(0, 10),
            'is_active' => true,
        ];
    }
}
