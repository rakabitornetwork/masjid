<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_campaigns', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->string('category', 50)->default('general');
            $table->text('message');
            $table->unsignedInteger('interval_minutes')->default(7);
            $table->dateTime('starts_at')->nullable();
            $table->string('status', 30)->default('queued');
            $table->unsignedInteger('total_recipients')->default(0);
            $table->unsignedInteger('sent_count')->default(0);
            $table->unsignedInteger('failed_count')->default(0);
            $table->unsignedInteger('pending_review_count')->default(0);
            $table->json('filters')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['status', 'starts_at']);
            $table->index(['category', 'created_at']);
        });

        Schema::create('whatsapp_campaign_recipients', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('whatsapp_campaign_id')->constrained()->cascadeOnDelete();
            $table->foreignId('congregant_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('whatsapp_notification_id')->nullable()->constrained()->nullOnDelete();
            $table->string('recipient_name');
            $table->string('recipient_phone', 50);
            $table->unsignedInteger('sequence')->default(0);
            $table->string('status', 30)->default('queued');
            $table->dateTime('scheduled_at')->nullable();
            $table->dateTime('sent_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->unique(['whatsapp_campaign_id', 'recipient_phone']);
            $table->index(['status', 'scheduled_at']);
            $table->index(['whatsapp_campaign_id', 'sequence']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_campaign_recipients');
        Schema::dropIfExists('whatsapp_campaigns');
    }
};
