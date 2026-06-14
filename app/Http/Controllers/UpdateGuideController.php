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
            'currentVersion' => '1.1',
            'latestVersion' => '1.1',
            'latestCommit' => '61191ba',
            'updateResult' => session('update_result'),
            'latestUpdate' => [
                'title' => 'Update Aplikasi v1.1',
                'date' => '14 Juni 2026',
                'summary' => 'Pembaruan halaman Update Aplikasi dengan tombol salin perintah, tombol jalankan update langsung, informasi versi terbaru, dan commit rilis.',
            ],
        ]);
    }

    public function run(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->role === 'admin', 403);

        $phpBinary = env('PHP_CLI_BINARY', 'php');

        $commands = [
            ['git', 'pull', 'origin', 'main'],
            ['composer', 'install', '--no-dev', '--optimize-autoloader'],
            [$phpBinary, 'artisan', 'migrate', '--force'],
            [$phpBinary, 'artisan', 'optimize:clear'],
            [$phpBinary, 'artisan', 'config:cache'],
            [$phpBinary, 'artisan', 'route:cache'],
            [$phpBinary, 'artisan', 'view:cache'],
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
