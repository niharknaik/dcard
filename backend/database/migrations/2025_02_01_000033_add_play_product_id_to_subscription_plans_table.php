<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscription_plans', function (Blueprint $table) {
            // Google Play Console subscription product id mapped to this plan.
            $table->string('play_product_id')->nullable()->index()->after('billing_period');
        });
    }

    public function down(): void
    {
        Schema::table('subscription_plans', function (Blueprint $table) {
            $table->dropIndex(['play_product_id']);
            $table->dropColumn('play_product_id');
        });
    }
};
