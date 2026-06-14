<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('facility_bookings', function (Blueprint $table): void {
            $table->foreignId('mosque_facility_id')
                ->nullable()
                ->after('id')
                ->constrained('mosque_facilities')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('facility_bookings', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('mosque_facility_id');
        });
    }
};
