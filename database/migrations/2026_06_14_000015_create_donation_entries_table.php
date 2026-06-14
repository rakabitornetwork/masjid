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
        Schema::create('donation_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('donation_campaign_id')->constrained()->cascadeOnDelete();
            $table->string('donor_name')->nullable();
            $table->string('donor_phone', 50)->nullable();
            $table->decimal('amount', 15, 2);
            $table->string('payment_method', 50)->default('cash');
            $table->date('donated_at');
            $table->string('status', 50)->default('confirmed');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['status', 'donated_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donation_entries');
    }
};
