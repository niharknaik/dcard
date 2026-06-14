<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ads', function (Blueprint $table) {
            $table->id();
            $table->string('placement');                  // dashboard_top, card_list, leads_top, app_footer
            $table->string('audience')->default('free');  // all|free|premium|business
            $table->string('title');
            $table->string('image')->nullable();          // banner image (public disk)
            $table->string('link')->nullable();           // tap-through URL
            $table->boolean('is_active')->default(true);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->unsignedInteger('priority')->default(0); // higher wins per placement
            $table->unsignedBigInteger('impressions')->default(0);
            $table->unsignedBigInteger('clicks')->default(0);
            $table->timestamps();

            $table->index(['placement', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ads');
    }
};
