<?php

namespace App\Http\Controllers;

use App\Models\ZakatCollection;
use App\Models\ZakatDistribution;
use App\Models\ZakatParticipant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ZakatController extends Controller
{
    public function index(): Response
    {
        $collectionMoney = (float) ZakatCollection::where('status', 'received')->sum('money_amount');
        $distributionMoney = (float) ZakatDistribution::where('status', 'distributed')->sum('money_amount');
        $collectionRice = (float) ZakatCollection::where('status', 'received')->sum('rice_amount');
        $distributionRice = (float) ZakatDistribution::where('status', 'distributed')->sum('rice_amount');

        return Inertia::render('Zakat/Index', [
            'collections' => ZakatCollection::with('participant')->latest('received_at')->latest()->limit(30)->get(),
            'distributions' => ZakatDistribution::with('participant')->latest('distributed_at')->latest()->limit(30)->get(),
            'muzakkiOptions' => ZakatParticipant::where('is_active', true)
                ->whereIn('role', ['muzakki', 'both'])
                ->orderBy('name')
                ->get(['id', 'name', 'phone', 'muzakki_type']),
            'mustahikOptions' => ZakatParticipant::where('is_active', true)
                ->whereIn('role', ['mustahik', 'both'])
                ->orderBy('name')
                ->get(['id', 'name', 'phone', 'address', 'family_count', 'mustahik_category']),
            'summary' => [
                'collection_money' => $collectionMoney,
                'distribution_money' => $distributionMoney,
                'balance_money' => $collectionMoney - $distributionMoney,
                'collection_rice' => $collectionRice,
                'distribution_rice' => $distributionRice,
                'balance_rice' => $collectionRice - $distributionRice,
            ],
        ]);
    }

    public function storeCollection(Request $request): RedirectResponse
    {
        ZakatCollection::create($request->validate([
            'zakat_participant_id' => [
                'nullable',
                Rule::exists('zakat_participants', 'id')
                    ->where(fn ($query) => $query->where('is_active', true)->whereIn('role', ['muzakki', 'both'])),
            ],
            'muzakki_name' => ['required', 'string', 'max:255'],
            'muzakki_phone' => ['nullable', 'string', 'max:50'],
            'type' => ['required', 'in:fitrah,maal,fidyah,infaq_zakat'],
            'money_amount' => ['nullable', 'numeric', 'min:0'],
            'rice_amount' => ['nullable', 'numeric', 'min:0'],
            'payment_method' => ['required', 'in:cash,transfer,qris,rice'],
            'received_at' => ['required', 'date'],
            'status' => ['required', 'in:received,pending,cancelled'],
            'notes' => ['nullable', 'string'],
        ]));

        return back()->with('success', 'Penerimaan zakat berhasil dicatat.');
    }

    public function storeDistribution(Request $request): RedirectResponse
    {
        ZakatDistribution::create($request->validate([
            'zakat_participant_id' => [
                'nullable',
                Rule::exists('zakat_participants', 'id')
                    ->where(fn ($query) => $query->where('is_active', true)->whereIn('role', ['mustahik', 'both'])),
            ],
            'mustahik_name' => ['required', 'string', 'max:255'],
            'mustahik_category' => ['required', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string'],
            'money_amount' => ['nullable', 'numeric', 'min:0'],
            'rice_amount' => ['nullable', 'numeric', 'min:0'],
            'distributed_at' => ['required', 'date'],
            'status' => ['required', 'in:distributed,scheduled,cancelled'],
            'notes' => ['nullable', 'string'],
        ]));

        return back()->with('success', 'Penyaluran zakat berhasil dicatat.');
    }

    public function destroyCollection(ZakatCollection $collection): RedirectResponse
    {
        $collection->delete();

        return back()->with('success', 'Penerimaan zakat berhasil dihapus.');
    }

    public function destroyDistribution(ZakatDistribution $distribution): RedirectResponse
    {
        $distribution->delete();

        return back()->with('success', 'Penyaluran zakat berhasil dihapus.');
    }
}
