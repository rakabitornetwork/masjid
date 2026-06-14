<?php

namespace App\Http\Controllers;

use App\Models\DonationEntry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DonationEntryController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        DonationEntry::create($this->validatedData($request));

        return back()->with('success', 'Catatan donasi berhasil ditambahkan.');
    }

    public function destroy(DonationEntry $donationEntry): RedirectResponse
    {
        $donationEntry->delete();

        return back()->with('success', 'Catatan donasi berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request): array
    {
        return $request->validate([
            'donation_campaign_id' => ['required', Rule::exists('donation_campaigns', 'id')],
            'donor_name' => ['nullable', 'string', 'max:255'],
            'donor_phone' => ['nullable', 'string', 'max:50'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['required', 'in:cash,transfer,qris,e_wallet'],
            'donated_at' => ['required', 'date'],
            'status' => ['required', 'in:pending,confirmed,cancelled'],
            'notes' => ['nullable', 'string'],
        ]);
    }
}
