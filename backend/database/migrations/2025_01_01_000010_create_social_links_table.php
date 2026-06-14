<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('card_id')->constrained()->cascadeOnDelete();
            // whatsapp|instagram|facebook|linkedin|youtube|x|telegram|github
            $table->string('platform', 30);
            $table->string('url', 500);
            $table->string('label')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['card_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_links');
    }
};
