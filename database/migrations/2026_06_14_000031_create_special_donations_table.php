<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('special_donations', function (Blueprint $table): void {
            $table->id();
            $table->string('donor_name')->nullable();
            $table->string('donor_phone', 50)->nullable();
            $table->string('category', 50)->default('sedekah_subuh');
            $table->string('purpose')->nullable();
            $table->decimal('amount', 15, 2);
            $table->string('payment_method', 30)->default('transfer');
            $table->date('donated_at');
            $table->string('status', 30)->default('confirmed');
            $table->boolean('is_anonymous')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['category', 'status']);
            $table->index('donated_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('special_donations');
    }
};
