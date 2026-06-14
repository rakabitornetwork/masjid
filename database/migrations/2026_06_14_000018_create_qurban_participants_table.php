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
        Schema::create('qurban_participants', function (Blueprint $table) {
            $table->id();
            $table->string('participant_name');
            $table->string('phone', 50)->nullable();
            $table->string('animal_type', 50)->default('goat');
            $table->unsignedTinyInteger('share_count')->default(1);
            $table->string('group_name')->nullable();
            $table->decimal('amount_paid', 15, 2)->default(0);
            $table->decimal('target_amount', 15, 2)->default(0);
            $table->string('payment_status', 50)->default('unpaid');
            $table->string('slaughter_status', 50)->default('registered');
            $table->date('registered_at');
            $table->date('slaughtered_at')->nullable();
            $table->text('distribution_notes')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['animal_type', 'payment_status', 'slaughter_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('qurban_participants');
    }
};
