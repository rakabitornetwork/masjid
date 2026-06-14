<?php

namespace App\Http\Controllers;

use App\Models\WaqfAsset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WaqfAssetController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('WaqfAssets/Index', [
            'assets' => WaqfAsset::latest('received_at')->latest()->get(),
            'summary' => [
                'total' => WaqfAsset::count(),
                'managed' => WaqfAsset::where('status', 'managed')->count(),
                'productive' => WaqfAsset::where('status', 'productive')->count(),
                'value' => (float) WaqfAsset::sum('estimated_value'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        WaqfAsset::create($this->validatedData($request));

        return back()->with('success', 'Data wakaf berhasil ditambahkan.');
    }

    public function update(Request $request, WaqfAsset $waqfAsset): RedirectResponse
    {
        $waqfAsset->update($this->validatedData($request));

        return back()->with('success', 'Data wakaf berhasil diperbarui.');
    }

    public function destroy(WaqfAsset $waqfAsset): RedirectResponse
    {
        $waqfAsset->delete();

        return back()->with('success', 'Data wakaf berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request): array
    {
        return $request->validate([
            'wakif_name' => ['required', 'string', 'max:255'],
            'wakif_phone' => ['nullable', 'string', 'max:50'],
            'asset_name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'in:cash,land,building,equipment,vehicle,book,other'],
            'description' => ['nullable', 'string'],
            'estimated_value' => ['nullable', 'numeric', 'min:0'],
            'received_at' => ['nullable', 'date'],
            'certificate_number' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:pledged,managed,productive,maintenance,sold,replaced'],
            'notes' => ['nullable', 'string'],
        ]);
    }
}
