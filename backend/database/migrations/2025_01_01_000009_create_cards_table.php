<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('team_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('card_template_id')->nullable()->constrained()->nullOnDelete();

            $table->string('slug')->unique();              // SEO friendly: john-doe
            $table->string('full_name');
            $table->string('profile_photo')->nullable();
            $table->string('designation')->nullable();
            $table->string('company')->nullable();
            $table->string('phone')->nullable();
            $table->string('whatsapp')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('address')->nullable();
            $table->text('about')->nullable();

            $table->json('theme')->nullable();             // per-card overrides
            $table->boolean('is_published')->default(true);
            $table->boolean('is_default')->default(false);
            $table->unsignedBigInteger('views_count')->default(0); // denormalized counter
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'is_published']);
            $table->index('team_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cards');
    }
};
