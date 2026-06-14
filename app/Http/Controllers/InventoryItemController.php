<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryItemController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Inventory/Index', [
            'items' => InventoryItem::orderByDesc('is_active')->orderBy('category')->orderBy('name')->get(),
            'summary' => [
                'total' => InventoryItem::count(),
                'active' => InventoryItem::where('is_active', true)->count(),
                'value' => (float) InventoryItem::where('is_active', true)->sum('estimated_value'),
                'maintenance' => InventoryItem::where('is_active', true)
                    ->whereNotNull('maintenance_due_at')
                    ->whereDate('maintenance_due_at', '<=', now()->addDays(30))
                    ->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        InventoryItem::create($this->validatedData($request));

        return back()->with('success', 'Inventaris berhasil ditambahkan.');
    }

    public function update(Request $request, InventoryItem $inventoryItem): RedirectResponse
    {
        $inventoryItem->update($this->validatedData($request));

        return back()->with('success', 'Inventaris berhasil diperbarui.');
    }

    public function destroy(InventoryItem $inventoryItem): RedirectResponse
    {
        $inventoryItem->delete();

        return back()->with('success', 'Inventaris berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'quantity' => ['required', 'integer', 'min:1'],
            'unit' => ['required', 'string', 'max:50'],
            'condition' => ['required', 'in:good,minor_damage,damaged,maintenance'],
            'location' => ['nullable', 'string', 'max:255'],
            'purchased_at' => ['nullable', 'date'],
            'estimated_value' => ['nullable', 'numeric', 'min:0'],
            'maintenance_due_at' => ['nullable', 'date'],
            'is_active' => ['boolean'],
            'notes' => ['nullable', 'string'],
        ]);
    }
}
