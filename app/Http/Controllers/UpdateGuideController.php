<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\Process\Process;

class UpdateGuideController extends Controller
{
    public function __invoke(): Response
    {
        $currentVersion = env('APP_VERSION', '1.1');
        $currentCommit = $this->currentGitCommit();
        $githubCommit = $this->latestGithubCommit();
        $latestCommit = $githubCommit['hash'] ?? 'Tidak terbaca';
        $updateAvailable = $githubCommit['hash'] !== null
            && $currentCommit !== null
            && $githubCommit['hash'] !== $currentCommit;

        return Inertia::render('System/Update', [
            'currentVersion' => $currentVersion,
            'latestVersion' => $currentVersion,
            'currentCommit' => $currentCommit ?? 'Tidak terbaca',
            'latestCommit' => $latestCommit,
            'updateAvailable' => $updateAvailable,
            'githubStatus' => $githubCommit['status'],
            'updateResult' => session('update_result'),
            'latestUpdate' => [
                'title' => $githubCommit['title'] ?? 'Informasi GitHub Tidak Tersedia',
                'date' => $githubCommit['date'] ?? now()->format('d M Y H:i:s'),
                'summary' => $githubCommit['summary'] ?? 'Aplikasi belum berhasil membaca informasi update terbaru dari GitHub. Periksa koneksi server atau akses repository.',
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
                'output' => $this->cleanProcessOutput($process->getOutput()),
                'error' => $this->cleanProcessOutput($process->getErrorOutput()),
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

    private function cleanProcessOutput(string $output): string
    {
        $output = preg_replace('/\e\[[\d;?]*[A-Za-z]/', '', $output) ?? $output;
        $output = preg_replace('/\r+/', "\n", $output) ?? $output;
        $output = preg_replace("/\n{3,}/", "\n\n", $output) ?? $output;
        $output = trim($output);

        if (strlen($output) <= 1600) {
            return $output;
        }

        return substr($output, 0, 1600)."\n... output dipersingkat agar terminal tetap rapi ...";
    }

    private function currentGitCommit(): ?string
    {
        $process = new Process(['git', 'rev-parse', '--short', 'HEAD'], base_path(), timeout: 10);
        $process->run();

        if (! $process->isSuccessful()) {
            return null;
        }

        return trim($process->getOutput()) ?: null;
    }

    /**
     * @return array{hash: ?string, title: ?string, date: ?string, summary: ?string, status: string}
     */
    private function latestGithubCommit(): array
    {
        try {
            $response = Http::timeout(8)
                ->acceptJson()
                ->withUserAgent('masjid-management-updater')
                ->get('https://api.github.com/repos/rakabitornetwork/masjid/commits/main');

            if (! $response->successful()) {
                return [
                    'hash' => null,
                    'title' => null,
                    'date' => null,
                    'summary' => null,
                    'status' => 'failed',
                ];
            }

            $payload = $response->json();
            $hash = isset($payload['sha']) ? substr((string) $payload['sha'], 0, 7) : null;
            $message = trim((string) data_get($payload, 'commit.message', ''));
            $messageLines = preg_split('/\r\n|\r|\n/', $message) ?: [];
            $title = trim($messageLines[0] ?? 'Update terbaru dari GitHub');
            $date = data_get($payload, 'commit.committer.date');

            return [
                'hash' => $hash,
                'title' => $title ?: 'Update terbaru dari GitHub',
                'date' => $date ? Carbon::parse($date)->timezone(config('app.timezone'))->format('d M Y H:i:s') : null,
                'summary' => 'Commit terbaru di branch main GitHub: '.$message,
                'status' => 'success',
            ];
        } catch (\Throwable) {
            return [
                'hash' => null,
                'title' => null,
                'date' => null,
                'summary' => null,
                'status' => 'failed',
            ];
        }
    }
}
