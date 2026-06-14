<?php

namespace App\Http\Controllers;

use App\Models\Congregant;
use App\Models\CongregantFamily;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CongregantController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Congregants/Index', [
            'congregants' => Congregant::with('family')->orderByDesc('is_active')->orderBy('name')->get(),
            'families' => CongregantFamily::where('is_active', true)->orderBy('family_head_name')->get(['id', 'family_head_name', 'neighborhood']),
            'summary' => [
                'total' => Congregant::count(),
                'active' => Congregant::where('is_active', true)->count(),
                'families' => CongregantFamily::where('is_active', true)->count(),
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
            'congregant_family_id' => ['nullable', 'exists:congregant_families,id'],
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
