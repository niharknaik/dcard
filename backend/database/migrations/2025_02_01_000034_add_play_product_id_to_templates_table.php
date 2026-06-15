<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            // Google Play Console one-time product id mapped to this template.
            $table->string('play_product_id')->nullable()->index()->after('is_free');
        });
    }

    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->dropIndex(['play_product_id']);
            $table->dropColumn('play_product_id');
        });
    }
};
