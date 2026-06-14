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
        $columns = ['bank_name', 'bank_account_number', 'bank_account_holder'];
        $existingColumns = array_values(array_filter(
            $columns,
            fn (string $column): bool => Schema::hasColumn('mosque_profiles', $column)
        ));

        if ($existingColumns === []) {
            return;
        }

        Schema::table('mosque_profiles', function (Blueprint $table) use ($existingColumns): void {
            $table->dropColumn($existingColumns);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mosque_profiles', function (Blueprint $table): void {
            if (! Schema::hasColumn('mosque_profiles', 'bank_name')) {
                $table->string('bank_name')->nullable();
            }

            if (! Schema::hasColumn('mosque_profiles', 'bank_account_number')) {
                $table->string('bank_account_number')->nullable();
            }

            if (! Schema::hasColumn('mosque_profiles', 'bank_account_holder')) {
                $table->string('bank_account_holder')->nullable();
            }
        });
    }
};
