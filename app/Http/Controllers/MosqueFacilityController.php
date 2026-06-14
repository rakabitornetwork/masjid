<?php

namespace App\Http\Controllers;

use App\Models\MosqueFacility;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MosqueFacilityController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('MosqueFacilities/Index', [
            'facilities' => MosqueFacility::withCount('bookings')
                ->orderByDesc('is_active')
                ->orderBy('category')
                ->orderBy('name')
                ->get(),
            'summary' => [
                'total' => MosqueFacility::count(),
                'active' => MosqueFacility::where('is_active', true)->count(),
                'bookable' => MosqueFacility::where('is_active', true)->where('is_bookable', true)->count(),
                'maintenance' => MosqueFacility::where('is_active', true)->where('availability_status', 'maintenance')->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        MosqueFacility::create($this->validatedData($request));

        return back()->with('success', 'Data fasilitas berhasil ditambahkan.');
    }

    public function update(Request $request, MosqueFacility $mosqueFacility): RedirectResponse
    {
        $mosqueFacility->update($this->validatedData($request));

        return back()->with('success', 'Data fasilitas berhasil diperbarui.');
    }

    public function destroy(MosqueFacility $mosqueFacility): RedirectResponse
    {
        $mosqueFacility->delete();

        return back()->with('success', 'Data fasilitas berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'in:room,hall,equipment,vehicle,parking,yard,service,other'],
            'location' => ['nullable', 'string', 'max:255'],
            'capacity' => ['nullable', 'integer', 'min:0'],
            'condition' => ['required', 'in:good,minor_damage,damaged,maintenance'],
            'availability_status' => ['required', 'in:available,booked,maintenance,unavailable'],
            'booking_fee' => ['nullable', 'numeric', 'min:0'],
            'responsible_person' => ['nullable', 'string', 'max:255'],
            'responsible_phone' => ['nullable', 'string', 'max:50'],
            'is_bookable' => ['boolean'],
            'is_active' => ['boolean'],
            'notes' => ['nullable', 'string'],
        ]);

        $data['capacity'] = (int) (($data['capacity'] ?? null) ?: 0);
        $data['booking_fee'] = (float) (($data['booking_fee'] ?? null) ?: 0);
        $data['is_bookable'] = (bool) ($data['is_bookable'] ?? false);
        $data['is_active'] = (bool) ($data['is_active'] ?? false);

        return $data;
    }
}
