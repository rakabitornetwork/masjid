<?php

namespace App\Http\Controllers;

use App\Models\MosqueProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MosqueProfileController extends Controller
{
    public function edit(): Response
    {
        $profile = MosqueProfile::first();

        return Inertia::render('MosqueProfile/Edit', [
            'profile' => $profile,
            'facilitiesText' => $profile?->facilities ? implode(', ', $profile->facilities) : '',
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'website' => ['nullable', 'string', 'max:255'],
            'vision' => ['nullable', 'string'],
            'mission' => ['nullable', 'string'],
            'founded_at' => ['nullable', 'date'],
            'capacity' => ['nullable', 'integer', 'min:0'],
            'facilities_text' => ['nullable', 'string'],
        ]);

        $data['facilities'] = collect(explode(',', (string) ($data['facilities_text'] ?? '')))
            ->map(fn (string $facility) => trim($facility))
            ->filter()
            ->values()
            ->all();
        unset($data['facilities_text']);

        $profile = MosqueProfile::first() ?? new MosqueProfile();
        $profile->fill($data);
        $profile->save();

        return back()->with('success', 'Profil masjid berhasil disimpan.');
    }
}
