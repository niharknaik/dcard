<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analytics_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('card_id')->constrained()->cascadeOnDelete();
            // view | unique_view | qr_scan | contact_save | link_click | portfolio_click
            $table->string('type', 30);
            $table->string('visitor_hash', 64)->nullable(); // hashed ip+ua for uniques
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 512)->nullable();
            $table->string('referrer', 512)->nullable();
            $table->string('country', 2)->nullable();
            $table->json('metadata')->nullable();           // e.g. {"platform":"linkedin"}
            $table->timestamp('created_at')->nullable()->useCurrent();

            $table->index(['card_id', 'type', 'created_at']);
            $table->index('visitor_hash');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_events');
    }
};
