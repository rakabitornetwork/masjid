<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_assistance_programs', function (Blueprint $table): void {
            $table->id();
            $table->string('program_name');
            $table->string('category', 50)->default('duafa');
            $table->string('recipient_name');
            $table->string('recipient_phone', 50)->nullable();
            $table->text('recipient_address')->nullable();
            $table->decimal('amount', 15, 2)->default(0);
            $table->text('item_description')->nullable();
            $table->date('distributed_at')->nullable();
            $table->string('status', 30)->default('planned');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['category', 'status']);
            $table->index('distributed_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_assistance_programs');
    }
};
