<?php

namespace App\Http\Controllers;

use App\Models\Congregant;
use App\Models\CongregantFamily;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CongregantFamilyController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('CongregantFamilies/Index', [
            'families' => CongregantFamily::withCount('congregants')
                ->orderByDesc('is_active')
                ->orderBy('family_head_name')
                ->get(),
            'summary' => [
                'total' => CongregantFamily::count(),
                'active' => CongregantFamily::where('is_active', true)->count(),
                'members' => Congregant::whereNotNull('congregant_family_id')->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        CongregantFamily::create($this->validatedData($request));

        return back()->with('success', 'Keluarga jamaah berhasil ditambahkan.');
    }

    public function update(Request $request, CongregantFamily $congregantFamily): RedirectResponse
    {
        $congregantFamily->update($this->validatedData($request));

        return back()->with('success', 'Keluarga jamaah berhasil diperbarui.');
    }

    public function destroy(CongregantFamily $congregantFamily): RedirectResponse
    {
        $congregantFamily->delete();

        return back()->with('success', 'Keluarga jamaah berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request): array
    {
        return $request->validate([
            'family_head_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string'],
            'neighborhood' => ['nullable', 'string', 'max:50'],
            'economic_status' => ['nullable', 'in:regular,duafa,priority,donor'],
            'is_active' => ['boolean'],
            'notes' => ['nullable', 'string'],
        ]);
    }
}
