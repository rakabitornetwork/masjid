<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_maintenances', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
            $table->date('maintenance_date');
            $table->string('type', 50)->default('routine');
            $table->string('handled_by')->nullable();
            $table->decimal('cost', 15, 2)->default(0);
            $table->string('status', 30)->default('scheduled');
            $table->text('description')->nullable();
            $table->date('next_due_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'maintenance_date']);
            $table->index(['inventory_item_id', 'maintenance_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_maintenances');
    }
};
