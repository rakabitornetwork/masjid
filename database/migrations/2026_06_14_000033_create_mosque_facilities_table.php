<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mosque_facilities', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('category', 80)->default('room');
            $table->string('location')->nullable();
            $table->unsignedInteger('capacity')->default(0);
            $table->string('condition', 30)->default('good');
            $table->string('availability_status', 30)->default('available');
            $table->decimal('booking_fee', 15, 2)->default(0);
            $table->string('responsible_person')->nullable();
            $table->string('responsible_phone', 50)->nullable();
            $table->boolean('is_bookable')->default(true);
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['category', 'is_active']);
            $table->index(['is_bookable', 'availability_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mosque_facilities');
    }
};
