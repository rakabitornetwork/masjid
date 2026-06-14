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
        Schema::table('committee_members', function (Blueprint $table): void {
            if (! Schema::hasColumn('committee_members', 'avatar_path')) {
                $table->string('avatar_path')->nullable()->after('email');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('committee_members', function (Blueprint $table): void {
            if (Schema::hasColumn('committee_members', 'avatar_path')) {
                $table->dropColumn('avatar_path');
            }
        });
    }
};
