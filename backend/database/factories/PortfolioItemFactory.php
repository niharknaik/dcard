<?php

namespace Database\Factories;

use App\Models\Card;
use App\Models\PortfolioItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PortfolioItem>
 */
class PortfolioItemFactory extends Factory
{
    protected $model = PortfolioItem::class;

    public function definition(): array
    {
        return [
            'card_id' => Card::factory(),
            'title' => fake()->sentence(3),
            'description' => fake()->sentence(),
            'type' => 'image',
            'media_path' => 'portfolio/sample.jpg',
            'mime_type' => 'image/jpeg',
            'size' => fake()->numberBetween(10000, 500000),
            'sort_order' => fake()->numberBetween(0, 10),
        ];
    }
}
