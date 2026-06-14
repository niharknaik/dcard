<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referrer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('referred_id')->constrained('users')->cascadeOnDelete();
            $table->string('referral_code');
            $table->unsignedInteger('points_awarded')->default(0);
            $table->string('status', 20)->default('rewarded'); // pending | rewarded
            $table->timestamp('rewarded_at')->nullable();
            $table->timestamps();

            $table->unique('referred_id'); // a user can only be referred once
            $table->index('referrer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};
