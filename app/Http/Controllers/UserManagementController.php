<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Users/Index', [
            'users' => User::orderBy('role')->orderBy('name')->get(['id', 'name', 'email', 'whatsapp_number', 'role', 'avatar_path', 'created_at']),
            'roles' => array_keys(User::ROLE_PERMISSIONS),
            'rolePermissions' => User::ROLE_PERMISSIONS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'whatsapp_number' => ['nullable', 'string', 'max:30'],
            'role' => ['required', Rule::in(array_keys(User::ROLE_PERMISSIONS))],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'whatsapp_number' => $data['whatsapp_number'] ?? null,
            'role' => $data['role'],
            'password' => Hash::make($data['password']),
        ]);

        return back()->with('success', 'User berhasil ditambahkan.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'whatsapp_number' => ['nullable', 'string', 'max:30'],
            'role' => ['required', Rule::in(array_keys(User::ROLE_PERMISSIONS))],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $user->fill([
            'name' => $data['name'],
            'email' => $data['email'],
            'whatsapp_number' => $data['whatsapp_number'] ?? null,
            'role' => $data['role'],
        ]);

        if (! empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        return back()->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($request->user()->is($user)) {
            return back()->with('error', 'Anda tidak dapat menghapus akun yang sedang digunakan.');
        }

        $user->delete();

        return back()->with('success', 'User berhasil dihapus.');
    }
}
