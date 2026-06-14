<?php

namespace App\Http\Controllers;

use App\Models\Congregant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CongregantController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Congregants/Index', [
            'congregants' => Congregant::orderByDesc('is_active')->orderBy('name')->get(),
            'summary' => [
                'total' => Congregant::count(),
                'active' => Congregant::where('is_active', true)->count(),
                'families' => Congregant::whereNotNull('family_head')->distinct('family_head')->count('family_head'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Congregant::create($this->validatedData($request));

        return back()->with('success', 'Data jamaah berhasil ditambahkan.');
    }

    public function update(Request $request, Congregant $congregant): RedirectResponse
    {
        $congregant->update($this->validatedData($request));

        return back()->with('success', 'Data jamaah berhasil diperbarui.');
    }

    public function destroy(Congregant $congregant): RedirectResponse
    {
        $congregant->delete();

        return back()->with('success', 'Data jamaah berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'family_head' => ['nullable', 'string', 'max:255'],
            'gender' => ['required', 'in:male,female'],
            'birth_date' => ['nullable', 'date'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
            'neighborhood' => ['nullable', 'string', 'max:50'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'marital_status' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
            'notes' => ['nullable', 'string'],
        ]);
    }
}
