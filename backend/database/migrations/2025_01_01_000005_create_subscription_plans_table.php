<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('code', 20)->unique();          // free | premium | business
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->char('currency', 3)->default('INR');
            $table->string('billing_period', 20)->default('monthly'); // monthly | yearly | lifetime
            $table->json('features')->nullable();          // feature flags / limits
            $table->integer('card_limit')->default(1);     // 0 = unlimited
            $table->boolean('allow_portfolio')->default(false);
            $table->boolean('allow_leads')->default(false);
            $table->boolean('allow_team')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
    }
};
