<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'whatsapp_number', 'role', 'avatar_path', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public const ROLE_PERMISSIONS = [
        'admin' => ['system', 'profile', 'people', 'content', 'finance', 'inventory', 'donations', 'programs', 'reports'],
        'bendahara' => ['finance', 'donations', 'programs', 'reports'],
        'sekretaris' => ['profile', 'people', 'content', 'inventory', 'programs'],
        'takmir' => ['people', 'content', 'inventory', 'programs'],
        'viewer' => ['reports'],
    ];

    /**
     * @return array<int, string>
     */
    public function permissions(): array
    {
        return self::ROLE_PERMISSIONS[$this->role] ?? [];
    }

    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissions(), true);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
