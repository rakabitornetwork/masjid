<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Process\Process;

class UpdateGuideController extends Controller
{
    public function __invoke(): Response
    {
        $currentVersion = $this->currentGitVersion() ?? env('APP_VERSION', '1.1');
        $currentCommit = $this->currentGitCommit();
        $githubRelease = $this->latestGithubRelease();
        $githubMain = $this->latestGithubMainCommit();
        $latestVersion = $githubRelease['version'] ?? $currentVersion;
        $latestCommit = $githubMain['hash'] ?? 'Tidak terbaca';
        $updateAvailable = $githubMain['status'] === 'success'
            && $githubMain['hash'] !== null
            && $currentCommit !== null
            && $githubMain['hash'] !== $currentCommit;

        return Inertia::render('System/Update', [
            'currentVersion' => $currentVersion,
            'latestVersion' => $latestVersion,
            'currentCommit' => $currentCommit ?? 'Tidak terbaca',
            'latestCommit' => $latestCommit,
            'releaseCommit' => $githubRelease['hash'] ?? 'Tidak terbaca',
            'updateAvailable' => $updateAvailable,
            'githubStatus' => $githubMain['status'],
            'updateResult' => session('update_result'),
            'latestUpdate' => [
                'title' => $githubRelease['title'] ?? 'Informasi GitHub Tidak Tersedia',
                'date' => $githubRelease['date'] ?? now()->format('d M Y H:i:s'),
                'summary' => $githubRelease['summary'] ?? 'Aplikasi belum berhasil membaca informasi release terbaru dari GitHub. Periksa koneksi server atau akses repository.',
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

    public function stream(Request $request): StreamedResponse
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

        return response()->stream(function () use ($commands): void {
            $send = function (array $payload): void {
                echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)."\n";

                if (ob_get_level() > 0) {
                    @ob_flush();
                }

                flush();
            };

            $send([
                'type' => 'status',
                'message' => 'Memulai proses update aplikasi...',
            ]);

            foreach ($commands as $command) {
                $commandText = implode(' ', $command);

                $send([
                    'type' => 'command',
                    'command' => $commandText,
                ]);

                $process = new Process($command, base_path(), timeout: 300);
                $process->run(function (string $type, string $buffer) use ($send): void {
                    $output = $this->cleanProcessOutput($buffer, 1200);

                    if ($output !== '') {
                        $send([
                            'type' => $type === Process::ERR ? 'error' : 'output',
                            'output' => $output,
                        ]);
                    }
                });

                $send([
                    'type' => 'exit',
                    'command' => $commandText,
                    'exitCode' => $process->getExitCode(),
                ]);

                if (! $process->isSuccessful()) {
                    $send([
                        'type' => 'failed',
                        'message' => 'Update berhenti karena salah satu perintah gagal.',
                        'finishedAt' => now()->format('d M Y H:i:s'),
                    ]);

                    return;
                }
            }

            $currentCommit = $this->currentGitCommit();
            $githubMain = $this->latestGithubMainCommit();
            $updateAvailable = $githubMain['status'] === 'success'
                && $githubMain['hash'] !== null
                && $currentCommit !== null
                && $githubMain['hash'] !== $currentCommit;

            $send([
                'type' => 'complete',
                'message' => 'Update aplikasi selesai dijalankan.',
                'finishedAt' => now()->format('d M Y H:i:s'),
                'currentCommit' => $currentCommit ?? 'Tidak terbaca',
                'latestCommit' => $githubMain['hash'] ?? 'Tidak terbaca',
                'githubStatus' => $githubMain['status'],
                'updateAvailable' => $updateAvailable,
            ]);
        }, 200, [
            'Content-Type' => 'application/x-ndjson',
            'Cache-Control' => 'no-cache, no-transform',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    private function cleanProcessOutput(string $output, int $limit = 1600): string
    {
        $output = preg_replace('/\e\[[\d;?]*[A-Za-z]/', '', $output) ?? $output;
        $output = preg_replace('/\r+/', "\n", $output) ?? $output;
        $output = preg_replace("/\n{3,}/", "\n\n", $output) ?? $output;
        $output = trim($output);

        if (strlen($output) <= $limit) {
            return $output;
        }

        return substr($output, 0, $limit)."\n... output dipersingkat agar terminal tetap rapi ...";
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

    private function currentGitVersion(): ?string
    {
        $process = new Process(['git', 'describe', '--tags', '--abbrev=0'], base_path(), timeout: 10);
        $process->run();

        if (! $process->isSuccessful()) {
            return null;
        }

        return trim($process->getOutput()) ?: null;
    }

    /**
     * @return array{version: ?string, hash: ?string, title: ?string, date: ?string, summary: ?string, status: string}
     */
    private function latestGithubRelease(): array
    {
        try {
            $response = Http::timeout(8)
                ->acceptJson()
                ->withUserAgent('masjid-management-updater')
                ->get('https://api.github.com/repos/rakabitornetwork/masjid/releases/latest');

            if (! $response->successful()) {
                return [
                    'version' => null,
                    'hash' => null,
                    'title' => null,
                    'date' => null,
                    'summary' => null,
                    'status' => 'failed',
                ];
            }

            $payload = $response->json();
            $version = (string) data_get($payload, 'tag_name', '');
            $title = (string) data_get($payload, 'name', 'Update terbaru dari GitHub');
            $body = $this->releaseSummary(trim((string) data_get($payload, 'body', '')), $title);
            $date = data_get($payload, 'published_at') ?: data_get($payload, 'created_at');
            $hash = $version !== '' ? $this->githubTagCommit($version) : null;

            return [
                'version' => $version ?: null,
                'hash' => $hash,
                'title' => $title ?: 'Update terbaru dari GitHub',
                'date' => $date ? Carbon::parse($date)->timezone(config('app.timezone'))->format('d M Y H:i:s') : null,
                'summary' => $body,
                'status' => 'success',
            ];
        } catch (\Throwable) {
            return [
                'version' => null,
                'hash' => null,
                'title' => null,
                'date' => null,
                'summary' => null,
                'status' => 'failed',
            ];
        }
    }

    private function releaseSummary(string $body, string $title): string
    {
        if ($body !== '' && ! str_contains(strtolower($body), 'full changelog')) {
            return $body;
        }

        return $title !== '' ? $title : 'Update terbaru dari GitHub';
    }

    private function githubTagCommit(string $tag): ?string
    {
        try {
            $response = Http::timeout(8)
                ->acceptJson()
                ->withUserAgent('masjid-management-updater')
                ->get('https://api.github.com/repos/rakabitornetwork/masjid/git/ref/tags/'.$tag);

            if (! $response->successful()) {
                return null;
            }

            $sha = data_get($response->json(), 'object.sha');

            return $sha ? substr((string) $sha, 0, 7) : null;
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * @return array{hash: ?string, title: ?string, date: ?string, summary: ?string, status: string}
     */
    private function latestGithubMainCommit(): array
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
            $title = trim($messageLines[0] ?? 'Commit terbaru branch main');
            $date = data_get($payload, 'commit.committer.date');

            return [
                'hash' => $hash,
                'title' => $title ?: 'Commit terbaru branch main',
                'date' => $date ? Carbon::parse($date)->timezone(config('app.timezone'))->format('d M Y H:i:s') : null,
                'summary' => $message,
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
