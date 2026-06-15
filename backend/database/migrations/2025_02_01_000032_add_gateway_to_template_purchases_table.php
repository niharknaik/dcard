<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('template_purchases', function (Blueprint $table) {
            // Payment gateway used to settle this row. Existing rows are Razorpay.
            $table->string('gateway', 30)->nullable()->default('razorpay')->index()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('template_purchases', function (Blueprint $table) {
            $table->dropIndex(['gateway']);
            $table->dropColumn('gateway');
        });
    }
};
