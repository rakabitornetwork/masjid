<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\InventoryMaintenance;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryMaintenanceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('InventoryMaintenances/Index', [
            'maintenances' => InventoryMaintenance::with('item')->latest('maintenance_date')->latest()->get(),
            'items' => InventoryItem::where('is_active', true)->orderBy('name')->get(['id', 'name', 'category', 'location']),
            'summary' => [
                'total' => InventoryMaintenance::count(),
                'scheduled' => InventoryMaintenance::where('status', 'scheduled')->count(),
                'completed' => InventoryMaintenance::where('status', 'completed')->count(),
                'cost' => (float) InventoryMaintenance::sum('cost'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $maintenance = InventoryMaintenance::create($this->validatedData($request));
        $this->syncNextDueDate($maintenance);

        return back()->with('success', 'Riwayat perawatan berhasil ditambahkan.');
    }

    public function update(Request $request, InventoryMaintenance $inventoryMaintenance): RedirectResponse
    {
        $inventoryMaintenance->update($this->validatedData($request));
        $this->syncNextDueDate($inventoryMaintenance);

        return back()->with('success', 'Riwayat perawatan berhasil diperbarui.');
    }

    public function destroy(InventoryMaintenance $inventoryMaintenance): RedirectResponse
    {
        $inventoryMaintenance->delete();

        return back()->with('success', 'Riwayat perawatan berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request): array
    {
        return $request->validate([
            'inventory_item_id' => ['required', 'exists:inventory_items,id'],
            'maintenance_date' => ['required', 'date'],
            'type' => ['required', 'in:routine,repair,inspection,cleaning,other'],
            'handled_by' => ['nullable', 'string', 'max:255'],
            'cost' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'in:scheduled,in_progress,completed,cancelled'],
            'description' => ['nullable', 'string'],
            'next_due_at' => ['nullable', 'date', 'after_or_equal:maintenance_date'],
        ]);
    }

    private function syncNextDueDate(InventoryMaintenance $maintenance): void
    {
        if ($maintenance->next_due_at) {
            $maintenance->item()->update([
                'maintenance_due_at' => $maintenance->next_due_at,
            ]);
        }
    }
}
