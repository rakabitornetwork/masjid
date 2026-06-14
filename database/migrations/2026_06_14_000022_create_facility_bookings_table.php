<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('facility_bookings', function (Blueprint $table): void {
            $table->id();
            $table->string('facility_name');
            $table->string('requester_name');
            $table->string('requester_phone', 50)->nullable();
            $table->string('event_name');
            $table->date('booking_date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->text('purpose')->nullable();
            $table->string('status', 30)->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['facility_name', 'booking_date']);
            $table->index(['status', 'booking_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facility_bookings');
    }
};
