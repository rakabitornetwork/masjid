<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('congregant_families', function (Blueprint $table): void {
            $table->id();
            $table->string('family_head_name');
            $table->string('phone', 50)->nullable();
            $table->text('address')->nullable();
            $table->string('neighborhood', 50)->nullable();
            $table->string('economic_status', 50)->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['is_active', 'neighborhood']);
        });

        Schema::table('congregants', function (Blueprint $table): void {
            $table->foreignId('congregant_family_id')
                ->nullable()
                ->after('id')
                ->constrained('congregant_families')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('congregants', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('congregant_family_id');
        });

        Schema::dropIfExists('congregant_families');
    }
};
