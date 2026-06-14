<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('template_purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('template_id')->constrained('templates')->cascadeOnDelete();

            $table->string('unlock_method', 20)->default('free'); // free | points | money | mixed
            $table->decimal('amount', 10, 2)->default(0);
            $table->char('currency', 3)->default('INR');
            $table->unsignedInteger('points_spent')->default(0);
            $table->string('status', 20)->default('completed'); // pending | completed | failed

            // Razorpay (only for money / mixed unlocks)
            $table->string('transaction_id')->nullable()->unique();
            $table->string('razorpay_order_id')->nullable()->index();
            $table->string('razorpay_payment_id')->nullable()->index();
            $table->string('razorpay_signature')->nullable();

            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'template_id']);
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('template_purchases');
    }
};
