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
        Schema::create('zakat_collections', function (Blueprint $table) {
            $table->id();
            $table->string('muzakki_name');
            $table->string('muzakki_phone', 50)->nullable();
            $table->string('type', 50)->default('fitrah');
            $table->decimal('money_amount', 15, 2)->default(0);
            $table->decimal('rice_amount', 8, 2)->default(0);
            $table->string('payment_method', 50)->default('cash');
            $table->date('received_at');
            $table->string('status', 50)->default('received');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['type', 'status', 'received_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zakat_collections');
    }
};
