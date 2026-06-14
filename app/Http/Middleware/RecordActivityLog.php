<?php

namespace App\Http\Middleware;

use App\Models\ActivityLog;
use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RecordActivityLog
{
    /**
     * @var array<int, string>
     */
    private const EXCLUDED_ROUTES = [
        'login.store',
        'logout',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($this->shouldRecord($request, $response)) {
            ActivityLog::record(
                request: $request,
                action: $this->actionFor($request),
                description: $this->descriptionFor($request),
                metadata: [
                    'input' => $this->safeInput($request),
                    'route_parameters' => $this->safeRouteParameters($request),
                ],
                statusCode: $response->getStatusCode(),
            );
        }

        return $response;
    }

    private function shouldRecord(Request $request, Response $response): bool
    {
        if (! $request->user() || $request->isMethodSafe()) {
            return false;
        }

        if ($response->getStatusCode() >= 500) {
            return false;
        }

        return ! in_array($request->route()?->getName(), self::EXCLUDED_ROUTES, true);
    }

    private function actionFor(Request $request): string
    {
        $routeName = (string) $request->route()?->getName();

        if (str_contains($routeName, 'restore')) {
            return 'restore';
        }

        if (str_contains($routeName, 'stream') || str_contains($routeName, 'run') || str_contains($routeName, 'reorder')) {
            return 'execute';
        }

        return match ($request->method()) {
            'POST' => 'create',
            'PUT', 'PATCH' => 'update',
            'DELETE' => 'delete',
            default => 'execute',
        };
    }

    private function descriptionFor(Request $request): string
    {
        $module = $this->moduleLabel((string) $request->route()?->getName(), $request->path());
        $verb = match ($this->actionFor($request)) {
            'create' => 'Menambah data',
            'update' => 'Mengubah data',
            'delete' => 'Menghapus data',
            'restore' => 'Melakukan restore',
            default => 'Menjalankan aksi',
        };

        return "{$verb} {$module}";
    }

    private function moduleLabel(string $routeName, string $path): string
    {
        $key = str($routeName ?: $path)->before('.')->before('/')->toString();

        return [
            'announcements' => 'Pengumuman',
            'backups' => 'Backup Data',
            'committee-members' => 'Pengurus',
            'congregants' => 'Jamaah',
            'document-archives' => 'Arsip Surat',
            'donations' => 'Donasi',
            'finance' => 'Keuangan',
            'inventory' => 'Inventaris',
            'mosque-profile' => 'Profil Masjid',
            'profile' => 'Profil Admin',
            'qurban' => 'Qurban',
            'schedules' => 'Jadwal',
            'updates' => 'Update Aplikasi',
            'users' => 'User Manajemen',
            'zakat' => 'Zakat',
        ][$key] ?? str($key)->replace('-', ' ')->title()->toString();
    }

    /**
     * @return array<string, mixed>
     */
    private function safeInput(Request $request): array
    {
        $input = $request->except([
            '_token',
            '_method',
            'password',
            'password_confirmation',
            'current_password',
            'avatar',
            'logo',
            'attachment',
            'backup_file',
        ]);

        foreach ($request->allFiles() as $key => $file) {
            $input[$key] = is_array($file)
                ? '[uploaded files]'
                : '[uploaded file: '.$file->getClientOriginalName().']';
        }

        return $input;
    }

    /**
     * @return array<string, mixed>
     */
    private function safeRouteParameters(Request $request): array
    {
        return collect($request->route()?->parameters() ?? [])
            ->map(fn (mixed $value): mixed => $value instanceof Model
                ? ['model' => $value::class, 'id' => $value->getKey()]
                : $value)
            ->all();
    }
}
