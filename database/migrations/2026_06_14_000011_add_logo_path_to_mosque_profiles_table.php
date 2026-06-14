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
        Schema::table('mosque_profiles', function (Blueprint $table): void {
            if (! Schema::hasColumn('mosque_profiles', 'logo_path')) {
                $table->string('logo_path')->nullable()->after('website');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mosque_profiles', function (Blueprint $table): void {
            if (Schema::hasColumn('mosque_profiles', 'logo_path')) {
                $table->dropColumn('logo_path');
            }
        });
    }
};
