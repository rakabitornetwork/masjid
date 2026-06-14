<?php

namespace App\Http\Controllers;

use App\Models\FacilityBooking;
use App\Models\MosqueFacility;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class FacilityBookingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('FacilityBookings/Index', [
            'bookings' => FacilityBooking::with('facility')->orderBy('booking_date')->orderBy('start_time')->get(),
            'facilityOptions' => MosqueFacility::where('is_active', true)
                ->where('is_bookable', true)
                ->whereIn('availability_status', ['available', 'booked'])
                ->orderBy('name')
                ->get(['id', 'name', 'category', 'location', 'capacity', 'booking_fee']),
            'summary' => [
                'total' => FacilityBooking::count(),
                'pending' => FacilityBooking::where('status', 'pending')->count(),
                'approved' => FacilityBooking::where('status', 'approved')->count(),
                'today' => FacilityBooking::whereDate('booking_date', today())->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);
        $this->ensureNoScheduleConflict($data);

        FacilityBooking::create($data);

        return back()->with('success', 'Booking fasilitas berhasil ditambahkan.');
    }

    public function update(Request $request, FacilityBooking $facilityBooking): RedirectResponse
    {
        $data = $this->validatedData($request);
        $this->ensureNoScheduleConflict($data, $facilityBooking);

        $facilityBooking->update($data);

        return back()->with('success', 'Booking fasilitas berhasil diperbarui.');
    }

    public function destroy(FacilityBooking $facilityBooking): RedirectResponse
    {
        $facilityBooking->delete();

        return back()->with('success', 'Booking fasilitas berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request): array
    {
        $data = $request->validate([
            'mosque_facility_id' => [
                'nullable',
                Rule::exists('mosque_facilities', 'id')
                    ->where(fn ($query) => $query->where('is_active', true)->where('is_bookable', true)),
            ],
            'facility_name' => ['required', 'string', 'max:255'],
            'requester_name' => ['required', 'string', 'max:255'],
            'requester_phone' => ['nullable', 'string', 'max:50'],
            'event_name' => ['required', 'string', 'max:255'],
            'booking_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'purpose' => ['nullable', 'string'],
            'status' => ['required', 'in:pending,approved,rejected,cancelled,done'],
            'notes' => ['nullable', 'string'],
        ]);

        if (! empty($data['mosque_facility_id'])) {
            $facility = MosqueFacility::find($data['mosque_facility_id']);
            $data['facility_name'] = $facility?->name ?? $data['facility_name'];
        }

        return $data;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function ensureNoScheduleConflict(array $data, ?FacilityBooking $currentBooking = null): void
    {
        if (! in_array($data['status'], ['pending', 'approved'], true)) {
            return;
        }

        $hasConflict = FacilityBooking::query()
            ->where('facility_name', $data['facility_name'])
            ->whereDate('booking_date', $data['booking_date'])
            ->whereIn('status', ['pending', 'approved'])
            ->when($currentBooking, fn ($query) => $query->whereKeyNot($currentBooking->id))
            ->where('start_time', '<', $data['end_time'])
            ->where('end_time', '>', $data['start_time'])
            ->exists();

        if ($hasConflict) {
            throw ValidationException::withMessages([
                'start_time' => 'Jadwal fasilitas ini sudah dipakai pada rentang waktu tersebut.',
            ]);
        }
    }
}
