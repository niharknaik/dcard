<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Deferred FK: users.default_card_id -> cards.id.
     * Added after the cards table exists to avoid circular ordering.
     *
     * Skipped on SQLite, which cannot add a foreign key to an existing table
     * via ALTER (only relevant to the in-memory test database; production is MySQL).
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->foreign('default_card_id')
                ->references('id')->on('cards')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['default_card_id']);
        });
    }
};
