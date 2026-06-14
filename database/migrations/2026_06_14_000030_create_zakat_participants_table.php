<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('zakat_participants', function (Blueprint $table): void {
            $table->id();
            $table->string('role', 30)->default('mustahik');
            $table->string('name');
            $table->string('phone', 50)->nullable();
            $table->string('identity_number', 50)->nullable();
            $table->text('address')->nullable();
            $table->unsignedSmallInteger('family_count')->default(1);
            $table->string('muzakki_type', 50)->nullable();
            $table->string('mustahik_category', 100)->nullable();
            $table->string('occupation', 100)->nullable();
            $table->string('income_range', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['role', 'is_active']);
            $table->index('mustahik_category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('zakat_participants');
    }
};
