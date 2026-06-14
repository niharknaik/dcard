<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('card_analytics_daily', function (Blueprint $table) {
            $table->id();
            $table->foreignId('card_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->unsignedInteger('views')->default(0);
            $table->unsignedInteger('unique_visitors')->default(0);
            $table->unsignedInteger('qr_scans')->default(0);
            $table->unsignedInteger('contact_saves')->default(0);
            $table->unsignedInteger('link_clicks')->default(0);
            $table->unsignedInteger('portfolio_clicks')->default(0);
            $table->timestamps();

            $table->unique(['card_id', 'date']);
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('card_analytics_daily');
    }
};
