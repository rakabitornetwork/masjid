<?php

namespace App\Http\Controllers;

use App\Models\SpecialDonation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SpecialDonationController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('SpecialDonations/Index', [
            'donations' => SpecialDonation::latest('donated_at')->latest()->get(),
            'summary' => [
                'collected' => (float) SpecialDonation::where('status', 'confirmed')->sum('amount'),
                'thisMonth' => (float) SpecialDonation::where('status', 'confirmed')
                    ->whereBetween('donated_at', [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()])
                    ->sum('amount'),
                'donors' => SpecialDonation::where('status', 'confirmed')->count(),
                'pending' => SpecialDonation::where('status', 'pending')->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        SpecialDonation::create($this->validatedData($request));

        return back()->with('success', 'Sedekah khusus berhasil dicatat.');
    }

    public function update(Request $request, SpecialDonation $specialDonation): RedirectResponse
    {
        $specialDonation->update($this->validatedData($request));

        return back()->with('success', 'Sedekah khusus berhasil diperbarui.');
    }

    public function destroy(SpecialDonation $specialDonation): RedirectResponse
    {
        $specialDonation->delete();

        return back()->with('success', 'Sedekah khusus berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request): array
    {
        $data = $request->validate([
            'donor_name' => ['nullable', 'string', 'max:255'],
            'donor_phone' => ['nullable', 'string', 'max:50'],
            'category' => ['required', 'in:sedekah_subuh,sedekah_jumat,yatim,iftar,pendidikan,kesehatan,sosial,operasional,other'],
            'purpose' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['required', 'in:cash,transfer,qris,e_wallet'],
            'donated_at' => ['required', 'date'],
            'status' => ['required', 'in:pending,confirmed,cancelled'],
            'is_anonymous' => ['boolean'],
            'notes' => ['nullable', 'string'],
        ]);

        $data['is_anonymous'] = (bool) ($data['is_anonymous'] ?? false);

        return $data;
    }
}
