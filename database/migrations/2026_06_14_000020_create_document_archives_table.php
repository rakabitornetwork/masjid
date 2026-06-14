<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_archives', function (Blueprint $table): void {
            $table->id();
            $table->string('type', 30)->default('incoming');
            $table->string('letter_number')->nullable();
            $table->string('title');
            $table->date('document_date')->nullable();
            $table->string('sender')->nullable();
            $table->string('recipient')->nullable();
            $table->string('category')->nullable();
            $table->string('status', 30)->default('archived');
            $table->string('attachment_path')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_archives');
    }
};
