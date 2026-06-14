<?php

namespace Database\Seeders;

use App\Models\TemplateCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TemplateCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Cafe & Restaurant', 'icon' => 'heroicon-o-cake'],
            ['name' => 'Corporate', 'icon' => 'heroicon-o-briefcase'],
            ['name' => 'Freelancer', 'icon' => 'heroicon-o-computer-desktop'],
            ['name' => 'Medical', 'icon' => 'heroicon-o-heart'],
            ['name' => 'Education', 'icon' => 'heroicon-o-academic-cap'],
            ['name' => 'Retail', 'icon' => 'heroicon-o-shopping-bag'],
            ['name' => 'Real Estate', 'icon' => 'heroicon-o-home-modern'],
            ['name' => 'Fitness', 'icon' => 'heroicon-o-bolt'],
            ['name' => 'Beauty', 'icon' => 'heroicon-o-sparkles'],
            ['name' => 'Events', 'icon' => 'heroicon-o-calendar-days'],
            ['name' => 'Creative', 'icon' => 'heroicon-o-camera'],
        ];

        foreach ($categories as $i => $category) {
            TemplateCategory::updateOrCreate(
                ['slug' => Str::slug($category['name'])],
                [
                    'name'       => $category['name'],
                    'icon'       => $category['icon'],
                    'is_active'  => true,
                    'sort_order' => $i + 1,
                ],
            );
        }
    }
}
