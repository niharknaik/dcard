<?php

namespace Database\Seeders;

use App\Models\Template;
use App\Models\TemplateCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TemplateSeeder extends Seeder
{
    public function run(): void
    {
        $categories = TemplateCategory::pluck('id', 'slug');

        // [category slug, name, layout, primary, accent, font, price ₹, points, is_free]
        $templates = [
            ['cafe-restaurant', 'Modern Cafe', 'hero', '#6F4E37', '#E0B589', 'Poppins', 0, 0, true],
            ['cafe-restaurant', 'Coffee Shop', 'classic', '#3E2723', '#A1887F', 'Lora', 0, 150, false],
            ['cafe-restaurant', 'Restaurant Premium', 'split', '#1B1B1B', '#C9A227', 'Playfair Display', 199, 199, false],

            ['corporate', 'Executive Card', 'split', '#0F172A', '#3B82F6', 'Inter', 299, 299, false],
            ['corporate', 'Startup Founder', 'hero', '#111827', '#8B5CF6', 'Sora', 0, 0, true],
            ['corporate', 'Consultant', 'classic', '#1E293B', '#0EA5E9', 'Inter', 0, 200, false],

            ['freelancer', 'Developer', 'minimal', '#0B1020', '#22D3EE', 'JetBrains Mono', 0, 0, true],
            ['freelancer', 'Designer', 'gallery', '#18181B', '#F472B6', 'Poppins', 149, 149, false],
            ['freelancer', 'Digital Marketer', 'hero', '#312E81', '#F59E0B', 'Sora', 0, 180, false],

            ['medical', 'Doctor', 'classic', '#0E7490', '#34D399', 'Inter', 199, 199, false],
            ['medical', 'Clinic', 'split', '#075985', '#38BDF8', 'Inter', 0, 0, true],

            ['education', 'Teacher', 'classic', '#7C2D12', '#FB923C', 'Lora', 0, 0, true],
            ['education', 'Tutor', 'minimal', '#1E3A8A', '#60A5FA', 'Inter', 0, 120, false],

            ['retail', 'Store Owner', 'hero', '#9D174D', '#FB7185', 'Poppins', 0, 0, true],
            ['retail', 'Fashion Shop', 'gallery', '#171717', '#E879F9', 'Playfair Display', 149, 149, false],

            ['real-estate', 'Property Consultant', 'split', '#14532D', '#A3E635', 'Inter', 249, 249, false],

            ['fitness', 'Personal Trainer', 'hero', '#0B1020', '#F97316', 'Sora', 0, 150, false],

            ['beauty', 'Salon Professional', 'gallery', '#581C87', '#F0ABFC', 'Poppins', 149, 149, false],

            ['events', 'Event Planner', 'hero', '#4C1D95', '#C4B5FD', 'Playfair Display', 199, 199, false],

            ['creative', 'Photographer', 'gallery', '#0A0A0A', '#FBBF24', 'Sora', 0, 0, true],
        ];

        foreach ($templates as $i => [$catSlug, $name, $layout, $primary, $accent, $font, $price, $points, $isFree]) {
            Template::updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'template_category_id' => $categories[$catSlug] ?? null,
                    'name'         => $name,
                    // Designed preview graphic (gradient + business icon), served by the web app.
                    'thumbnail'    => rtrim(config('app.frontend_url'), '/').'/templates/'.Str::slug($name).'.png',
                    'description'  => "A {$name} digital card template — polished {$layout} layout with a curated colour scheme.",
                    'layout'       => $layout,
                    'color_scheme' => $primary,
                    'font_family'  => $font,
                    'config'       => [
                        'colors' => ['primary' => $primary, 'accent' => $accent],
                        'font'   => $font,
                        'layout' => $layout,
                        'sections' => ['portfolio' => true, 'contact' => true, 'social' => true],
                    ],
                    'price'         => $price,
                    'currency'      => 'INR',
                    'price_points'  => $points,
                    'is_free'       => $isFree,
                    'has_portfolio' => true,
                    'has_contact'   => true,
                    'has_social'    => true,
                    'is_active'     => true,
                    'sort_order'    => $i + 1,
                ],
            );
        }
    }
}
