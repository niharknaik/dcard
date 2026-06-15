<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_reports', function (Blueprint $table) {
            $table->id();
            // The reported public card. Cascade so resolved/old reports clean up
            // when a card is permanently deleted.
            $table->foreignId('card_id')->constrained()->cascadeOnDelete();
            // Optional: a specific portfolio item within the card.
            $table->foreignId('portfolio_item_id')->nullable()->constrained()->nullOnDelete();

            // Reporter — anonymous public visitor (email/name optional) or, if we
            // later capture auth, the reporting user.
            $table->foreignId('reporter_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reporter_name')->nullable();
            $table->string('reporter_email')->nullable();

            $table->string('reason', 20); // spam | abuse | illegal | impersonation | other
            $table->text('details')->nullable();
            $table->string('status', 20)->default('pending'); // pending | reviewing | actioned | dismissed

            // Moderation trail.
            $table->text('resolution_note')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();

            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index(['card_id', 'status']);
            $table->index('status');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_reports');
    }
};
