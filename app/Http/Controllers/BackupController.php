<?php

namespace App\Http\Controllers;

use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BackupController extends Controller
{
    private const BACKUP_VERSION = 1;

    private const TABLES = [
        'users',
        'mosque_profiles',
        'committee_members',
        'announcements',
        'public_articles',
        'whatsapp_notifications',
        'schedules',
        'document_archives',
        'facility_bookings',
        'financial_accounts',
        'financial_categories',
        'financial_transactions',
        'congregant_families',
        'congregants',
        'inventory_items',
        'inventory_maintenances',
        'donation_campaigns',
        'donation_entries',
        'special_donations',
        'zakat_participants',
        'zakat_collections',
        'zakat_distributions',
        'qurban_participants',
        'waqf_assets',
        'social_assistance_programs',
        'activity_logs',
    ];

    public function index(): Response
    {
        return Inertia::render('System/Backup', [
            'tables' => collect(self::TABLES)->map(fn (string $table): array => [
                'name' => $table,
                'exists' => Schema::hasTable($table),
                'rows' => Schema::hasTable($table) ? DB::table($table)->count() : 0,
            ])->values(),
            'connection' => DB::connection()->getName(),
            'driver' => DB::connection()->getDriverName(),
        ]);
    }

    public function download(): StreamedResponse
    {
        $payload = [
            'app' => 'masjid-management',
            'version' => self::BACKUP_VERSION,
            'generated_at' => now()->toISOString(),
            'connection' => DB::connection()->getName(),
            'driver' => DB::connection()->getDriverName(),
            'tables' => collect(self::TABLES)
                ->filter(fn (string $table): bool => Schema::hasTable($table))
                ->mapWithKeys(fn (string $table): array => [
                    $table => DB::table($table)
                        ->when(Schema::hasColumn($table, 'id'), fn ($query) => $query->orderBy('id'))
                        ->get()
                        ->map(fn (object $row): array => (array) $row)
                        ->values()
                        ->all(),
                ])
                ->all(),
        ];

        $filename = 'backup-masjid-'.now()->format('Ymd-His').'.json';

        return response()->streamDownload(function () use ($payload): void {
            echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }, $filename, [
            'Content-Type' => 'application/json; charset=UTF-8',
        ]);
    }

    public function restore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'backup_file' => ['required', 'file', 'mimes:json,txt', 'max:51200'],
            'confirmation' => ['required', 'in:RESTORE'],
        ]);

        $payload = json_decode(file_get_contents($validated['backup_file']->getRealPath()), true);

        if (! is_array($payload) || ($payload['app'] ?? null) !== 'masjid-management' || ! is_array($payload['tables'] ?? null)) {
            return back()->with('error', 'File backup tidak valid untuk aplikasi ini.');
        }

        $restoredTables = $this->withoutForeignKeyChecks(function () use ($payload): int {
            return DB::transaction(function () use ($payload): int {
                $tables = $payload['tables'];
                $restoredTables = 0;

                foreach (array_reverse(self::TABLES) as $table) {
                    if (array_key_exists($table, $tables) && Schema::hasTable($table)) {
                        DB::table($table)->delete();
                    }
                }

                foreach (self::TABLES as $table) {
                    if (! array_key_exists($table, $tables) || ! Schema::hasTable($table)) {
                        continue;
                    }

                    collect($tables[$table])
                        ->chunk(200)
                        ->each(fn ($rows) => DB::table($table)->insert($rows->all()));

                    $restoredTables++;
                }

                return $restoredTables;
            });
        });

        return back()->with('success', "Restore berhasil. {$restoredTables} tabel aplikasi dipulihkan.");
    }

    private function withoutForeignKeyChecks(Closure $callback): mixed
    {
        $driver = DB::connection()->getDriverName();

        try {
            if ($driver === 'mysql') {
                DB::statement('SET FOREIGN_KEY_CHECKS=0');
            }

            if ($driver === 'sqlite') {
                DB::statement('PRAGMA foreign_keys = OFF');
            }

            return $callback();
        } finally {
            if ($driver === 'mysql') {
                DB::statement('SET FOREIGN_KEY_CHECKS=1');
            }

            if ($driver === 'sqlite') {
                DB::statement('PRAGMA foreign_keys = ON');
            }
        }
    }
}
