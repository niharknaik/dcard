<?php

namespace Database\Factories;

use App\Models\Card;
use App\Models\Lead;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Lead>
 */
class LeadFactory extends Factory
{
    protected $model = Lead::class;

    public function definition(): array
    {
        return [
            'card_id' => Card::factory(),
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->numerify('+9198########'),
            'message' => fake()->sentence(10),
            'source' => 'public',
            'is_read' => false,
        ];
    }
}
