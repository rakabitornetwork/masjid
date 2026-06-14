<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('waqf_assets', function (Blueprint $table): void {
            $table->id();
            $table->string('wakif_name');
            $table->string('wakif_phone', 50)->nullable();
            $table->string('asset_name');
            $table->string('category', 50)->default('cash');
            $table->text('description')->nullable();
            $table->decimal('estimated_value', 15, 2)->default(0);
            $table->date('received_at')->nullable();
            $table->string('certificate_number')->nullable();
            $table->string('location')->nullable();
            $table->string('status', 30)->default('managed');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['category', 'status']);
            $table->index('received_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waqf_assets');
    }
};
