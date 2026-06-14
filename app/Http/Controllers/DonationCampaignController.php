<?php

namespace App\Http\Controllers;

use App\Models\DonationCampaign;
use App\Models\DonationEntry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DonationCampaignController extends Controller
{
    public function index(): Response
    {
        $campaigns = DonationCampaign::with('entries')
            ->orderByDesc('is_featured')
            ->latest()
            ->get();

        return Inertia::render('Donations/Index', [
            'campaigns' => $campaigns,
            'entries' => DonationEntry::with('campaign')
                ->latest('donated_at')
                ->latest()
                ->limit(25)
                ->get(),
            'summary' => [
                'active' => DonationCampaign::where('status', 'active')->count(),
                'collected' => (float) DonationEntry::where('status', 'confirmed')->sum('amount'),
                'donors' => DonationEntry::where('status', 'confirmed')->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        DonationCampaign::create($this->validatedData($request));

        return back()->with('success', 'Program donasi berhasil ditambahkan.');
    }

    public function update(Request $request, DonationCampaign $donationCampaign): RedirectResponse
    {
        $donationCampaign->update($this->validatedData($request));

        return back()->with('success', 'Program donasi berhasil diperbarui.');
    }

    public function destroy(DonationCampaign $donationCampaign): RedirectResponse
    {
        $donationCampaign->delete();

        return back()->with('success', 'Program donasi berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'target_amount' => ['nullable', 'numeric', 'min:0'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'status' => ['required', 'in:active,paused,completed'],
            'is_featured' => ['boolean'],
        ]);
    }
}
