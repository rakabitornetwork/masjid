<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('zakat_collections', function (Blueprint $table): void {
            $table->foreignId('zakat_participant_id')
                ->nullable()
                ->after('id')
                ->constrained('zakat_participants')
                ->nullOnDelete();
        });

        Schema::table('zakat_distributions', function (Blueprint $table): void {
            $table->foreignId('zakat_participant_id')
                ->nullable()
                ->after('id')
                ->constrained('zakat_participants')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('zakat_collections', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('zakat_participant_id');
        });

        Schema::table('zakat_distributions', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('zakat_participant_id');
        });
    }
};
