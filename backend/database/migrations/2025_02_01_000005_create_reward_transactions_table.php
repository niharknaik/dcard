<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reward_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reward_wallet_id')->constrained('reward_wallets')->cascadeOnDelete();

            $table->string('type', 10);   // credit | debit
            $table->string('source', 30); // referral | signup_bonus | promotional | admin | template_redemption | adjustment
            $table->integer('points');
            $table->integer('balance_after');
            $table->string('description')->nullable();

            // Optional polymorphic reference (e.g. a Referral or TemplatePurchase)
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->json('meta')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index('source');
            $table->index(['reference_type', 'reference_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reward_transactions');
    }
};
