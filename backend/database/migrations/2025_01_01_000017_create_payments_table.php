<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subscription_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('subscription_plan_id')->nullable()->constrained()->nullOnDelete();

            $table->string('transaction_id')->unique();          // internal reference
            $table->string('razorpay_order_id')->nullable()->index();
            $table->string('razorpay_payment_id')->nullable()->index();
            $table->string('razorpay_signature')->nullable();

            $table->decimal('amount', 10, 2);
            $table->char('currency', 3)->default('INR');
            // created | paid | failed | refunded
            $table->string('status', 20)->default('created');
            $table->string('method')->nullable();                // card, upi, netbanking
            $table->string('invoice_number')->nullable()->unique();
            $table->json('meta')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
