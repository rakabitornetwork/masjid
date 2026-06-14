<?php

namespace App\Http\Middleware;

use App\Models\MosqueProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user()?->only('id', 'name', 'email', 'role', 'avatar_path'),
            ],
            'app' => [
                'name' => fn () => Schema::hasTable('mosque_profiles')
                    ? MosqueProfile::query()->value('name')
                    : null,
                'tagline' => fn () => Schema::hasTable('mosque_profiles')
                    ? MosqueProfile::query()->value('tagline')
                    : null,
                'logo_path' => fn () => Schema::hasTable('mosque_profiles') && Schema::hasColumn('mosque_profiles', 'logo_path')
                    ? MosqueProfile::query()->value('logo_path')
                    : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
