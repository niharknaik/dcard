<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Adds the applied marketplace template to cards. This is purely additive —
     * the existing `card_template_id` (simple visual templates) is left untouched.
     */
    public function up(): void
    {
        Schema::table('cards', function (Blueprint $table) {
            $table->unsignedBigInteger('template_id')->nullable()->after('card_template_id');
        });

        // SQLite cannot add a foreign key to an existing table via ALTER TABLE
        // (mirrors the project's add_default_card_fk migration).
        if (DB::getDriverName() !== 'sqlite') {
            Schema::table('cards', function (Blueprint $table) {
                $table->foreign('template_id')->references('id')->on('templates')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::table('cards', function (Blueprint $table) {
            if (DB::getDriverName() !== 'sqlite') {
                $table->dropForeign(['template_id']);
            }
            $table->dropColumn('template_id');
        });
    }
};
