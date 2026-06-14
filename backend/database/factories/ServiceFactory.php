<?php

namespace Database\Factories;

use App\Models\Card;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    protected $model = Service::class;

    public function definition(): array
    {
        return [
            'card_id' => Card::factory(),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'price' => fake()->randomFloat(2, 100, 10000),
            'currency' => 'INR',
            'sort_order' => fake()->numberBetween(0, 10),
            'is_active' => true,
        ];
    }
}
