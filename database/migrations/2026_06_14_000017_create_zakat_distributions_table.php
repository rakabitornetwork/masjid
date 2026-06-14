<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('zakat_distributions', function (Blueprint $table) {
            $table->id();
            $table->string('mustahik_name');
            $table->string('mustahik_category', 100)->default('fakir_miskin');
            $table->string('phone', 50)->nullable();
            $table->text('address')->nullable();
            $table->decimal('money_amount', 15, 2)->default(0);
            $table->decimal('rice_amount', 8, 2)->default(0);
            $table->date('distributed_at');
            $table->string('status', 50)->default('distributed');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['mustahik_category', 'status', 'distributed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zakat_distributions');
    }
};
