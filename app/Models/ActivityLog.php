<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

#[Fillable([
    'user_id',
    'user_name',
    'user_email',
    'action',
    'description',
    'method',
    'route_name',
    'path',
    'ip_address',
    'user_agent',
    'status_code',
    'metadata',
])]
class ActivityLog extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @param  array<string, mixed>  $metadata
     */
    public static function record(Request $request, string $action, string $description, array $metadata = [], ?User $user = null, ?int $statusCode = null): void
    {
        if (! Schema::hasTable('activity_logs')) {
            return;
        }

        $user ??= $request->user();

        self::create([
            'user_id' => $user?->id,
            'user_name' => $user?->name,
            'user_email' => $user?->email,
            'action' => $action,
            'description' => $description,
            'method' => $request->method(),
            'route_name' => $request->route()?->getName(),
            'path' => $request->path(),
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 500),
            'status_code' => $statusCode,
            'metadata' => $metadata ?: null,
        ]);
    }
}
