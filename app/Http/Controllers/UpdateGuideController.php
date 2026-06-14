<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\Process\Process;

class UpdateGuideController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('System/Update', [
            'currentVersion' => '1.0.0',
            'latestVersion' => '1.0.0',
            'updateResult' => session('update_result'),
            'latestUpdate' => [
                'title' => 'Fase 1 Manajemen Masjid',
                'date' => '14 Juni 2026',
                'summary' => 'Rilis awal aplikasi dengan dashboard, profil masjid, pengurus, pengumuman, jadwal, dan keuangan dasar.',
                'items' => [
                    'Laravel 13, Inertia.js, React, Tailwind CSS, dan lucide-react.',
                    'Login admin awal admin@masjid.com dengan password 12345678.',
                    'Build frontend public/build sudah siap dipush untuk VPS tanpa npm.',
                    'Menu Update Aplikasi berisi tombol update dan informasi versi.',
                ],
            ],
        ]);
    }

    public function run(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->role === 'admin', 403);

        $commands = [
            ['git', 'pull', 'origin', 'main'],
            ['composer', 'install', '--no-dev', '--optimize-autoloader'],
            [PHP_BINARY, 'artisan', 'migrate', '--force'],
            [PHP_BINARY, 'artisan', 'optimize:clear'],
            [PHP_BINARY, 'artisan', 'config:cache'],
            [PHP_BINARY, 'artisan', 'route:cache'],
            [PHP_BINARY, 'artisan', 'view:cache'],
        ];

        $logs = [];

        foreach ($commands as $command) {
            $process = new Process($command, base_path(), timeout: 300);
            $process->run();

            $logs[] = [
                'command' => implode(' ', $command),
                'exitCode' => $process->getExitCode(),
                'output' => trim($process->getOutput()),
                'error' => trim($process->getErrorOutput()),
            ];

            if (! $process->isSuccessful()) {
                return back()
                    ->with('error', 'Update berhenti karena salah satu perintah gagal.')
                    ->with('update_result', [
                        'status' => 'failed',
                        'finished_at' => now()->format('d M Y H:i:s'),
                        'logs' => $logs,
                    ]);
            }
        }

        return back()
            ->with('success', 'Update aplikasi selesai dijalankan.')
            ->with('update_result', [
                'status' => 'success',
                'finished_at' => now()->format('d M Y H:i:s'),
                'logs' => $logs,
            ]);
    }
}
