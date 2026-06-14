<?php

namespace Database\Factories;

use App\Models\Card;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Card>
 */
class CardFactory extends Factory
{
    protected $model = Card::class;

    public function definition(): array
    {
        $name = fake()->name();

        return [
            'user_id' => User::factory(),
            'slug' => Str::slug($name).'-'.fake()->unique()->numerify('####'),
            'full_name' => $name,
            'designation' => fake()->jobTitle(),
            'company' => fake()->company(),
            'phone' => fake()->numerify('+9198########'),
            'whatsapp' => fake()->numerify('+9198########'),
            'email' => fake()->safeEmail(),
            'website' => fake()->url(),
            'address' => fake()->address(),
            'about' => fake()->sentence(12),
            'is_published' => true,
            'is_default' => false,
            'views_count' => 0,
        ];
    }

    public function unpublished(): static
    {
        return $this->state(fn () => ['is_published' => false]);
    }
}
