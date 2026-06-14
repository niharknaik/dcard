<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Custom in-app notification center (NOT push, NOT Laravel's polymorphic
     * notifications table). Lightweight, indexed for fast unread counts.
     */
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // new_lead | subscription_activated | subscription_expiring |
            // view_milestone | payment_success | payment_failed
            $table->string('type', 40);
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable();          // deep-link payload (card_id, etc.)
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'is_read', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
