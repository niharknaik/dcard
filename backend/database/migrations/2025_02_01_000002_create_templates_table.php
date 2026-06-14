<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_category_id')->nullable()->constrained('template_categories')->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            // Media
            $table->string('thumbnail')->nullable();
            $table->json('preview_images')->nullable();

            // Design — color scheme, layout, fonts and section toggles
            $table->string('layout', 40)->default('classic');
            $table->string('color_scheme', 40)->nullable();
            $table->string('font_family', 60)->nullable();
            $table->json('config')->nullable();

            // Pricing — money (INR) and/or reward points
            $table->decimal('price', 10, 2)->default(0);
            $table->char('currency', 3)->default('INR');
            $table->unsignedInteger('price_points')->default(0);
            $table->boolean('is_free')->default(false);

            // Section support flags
            $table->boolean('has_portfolio')->default(true);
            $table->boolean('has_contact')->default(true);
            $table->boolean('has_social')->default(true);

            // Visibility + counters
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->unsignedInteger('purchases_count')->default(0);
            $table->unsignedInteger('usage_count')->default(0);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_active', 'is_free']);
            $table->index('template_category_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('templates');
    }
};
