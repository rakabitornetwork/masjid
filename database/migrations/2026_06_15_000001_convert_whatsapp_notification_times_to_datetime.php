<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('whatsapp_notifications')) {
            return;
        }

        $connection = DB::connection()->getDriverName();

        if (in_array($connection, ['mysql', 'mariadb'], true)) {
            DB::statement('ALTER TABLE whatsapp_notifications MODIFY scheduled_at DATETIME NULL, MODIFY sent_at DATETIME NULL');

            return;
        }

        Schema::table('whatsapp_notifications', function (Blueprint $table): void {
            $table->dateTime('scheduled_at')->nullable()->change();
            $table->dateTime('sent_at')->nullable()->change();
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('whatsapp_notifications')) {
            return;
        }

        $connection = DB::connection()->getDriverName();

        if (in_array($connection, ['mysql', 'mariadb'], true)) {
            DB::statement('ALTER TABLE whatsapp_notifications MODIFY scheduled_at TIMESTAMP NULL, MODIFY sent_at TIMESTAMP NULL');

            return;
        }

        Schema::table('whatsapp_notifications', function (Blueprint $table): void {
            $table->timestamp('scheduled_at')->nullable()->change();
            $table->timestamp('sent_at')->nullable()->change();
        });
    }
};
