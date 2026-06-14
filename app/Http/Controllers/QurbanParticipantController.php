<?php

namespace App\Http\Controllers;

use App\Models\QurbanParticipant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QurbanParticipantController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Qurban/Index', [
            'participants' => QurbanParticipant::latest('registered_at')->latest()->get(),
            'summary' => [
                'total' => QurbanParticipant::count(),
                'goat' => QurbanParticipant::where('animal_type', 'goat')->count(),
                'cowShares' => QurbanParticipant::where('animal_type', 'cow')->sum('share_count'),
                'paid' => (float) QurbanParticipant::sum('amount_paid'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        QurbanParticipant::create($this->validatedData($request));

        return back()->with('success', 'Data qurban berhasil ditambahkan.');
    }

    public function update(Request $request, QurbanParticipant $qurbanParticipant): RedirectResponse
    {
        $qurbanParticipant->update($this->validatedData($request));

        return back()->with('success', 'Data qurban berhasil diperbarui.');
    }

    public function destroy(QurbanParticipant $qurbanParticipant): RedirectResponse
    {
        $qurbanParticipant->delete();

        return back()->with('success', 'Data qurban berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request): array
    {
        return $request->validate([
            'participant_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'animal_type' => ['required', 'in:goat,cow'],
            'share_count' => ['required', 'integer', 'min:1', 'max:7'],
            'group_name' => ['nullable', 'string', 'max:255'],
            'amount_paid' => ['nullable', 'numeric', 'min:0'],
            'target_amount' => ['nullable', 'numeric', 'min:0'],
            'payment_status' => ['required', 'in:unpaid,partial,paid'],
            'slaughter_status' => ['required', 'in:registered,ready,slaughtered,distributed'],
            'registered_at' => ['required', 'date'],
            'slaughtered_at' => ['nullable', 'date'],
            'distribution_notes' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);
    }
}
