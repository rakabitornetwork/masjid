<?php

namespace App\Http\Controllers;

use App\Models\ZakatCollection;
use App\Models\ZakatDistribution;
use App\Models\ZakatParticipant;
use App\Services\AutomatedWhatsappNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ZakatController extends Controller
{
    public function index(AutomatedWhatsappNotificationService $whatsapp): Response
    {
        $collectionMoney = (float) ZakatCollection::where('status', 'received')->sum('money_amount');
        $distributionMoney = (float) ZakatDistribution::where('status', 'distributed')->sum('money_amount');
        $collectionRice = (float) ZakatCollection::where('status', 'received')->sum('rice_amount');
        $distributionRice = (float) ZakatDistribution::where('status', 'distributed')->sum('rice_amount');

        return Inertia::render('Zakat/Index', [
            'collections' => ZakatCollection::with('participant')->latest('received_at')->latest()->limit(30)->get(),
            'distributions' => ZakatDistribution::with('participant')->latest('distributed_at')->latest()->limit(30)->get(),
            'api' => $whatsapp->gatewayInfo(),
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

    public function storeCollection(Request $request, AutomatedWhatsappNotificationService $whatsapp): RedirectResponse
    {
        $collection = ZakatCollection::create($request->validate([
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

        if (! $request->boolean('send_whatsapp')) {
            return back()->with('success', 'Penerimaan zakat berhasil dicatat.');
        }

        $sendResult = $whatsapp->send(
            title: 'Konfirmasi Penerimaan Zakat',
            category: 'zakat',
            recipientName: $collection->muzakki_name,
            recipientPhone: $collection->muzakki_phone,
            message: $this->collectionConfirmationMessage($collection),
            sourceNotes: 'Dibuat otomatis dari form Penerimaan Zakat.',
            missingPhoneMessage: 'WhatsApp tidak dikirim karena nomor WA muzakki belum diisi.',
        );

        return back()->with('success', 'Penerimaan zakat berhasil dicatat. '.$sendResult);
    }

    public function storeDistribution(Request $request, AutomatedWhatsappNotificationService $whatsapp): RedirectResponse
    {
        $distribution = ZakatDistribution::create($request->validate([
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

        if (! $request->boolean('send_whatsapp')) {
            return back()->with('success', 'Penyaluran zakat berhasil dicatat.');
        }

        $sendResult = $whatsapp->send(
            title: 'Konfirmasi Penyaluran Zakat',
            category: 'zakat',
            recipientName: $distribution->mustahik_name,
            recipientPhone: $distribution->phone,
            message: $this->distributionConfirmationMessage($distribution),
            sourceNotes: 'Dibuat otomatis dari form Penyaluran Zakat.',
            missingPhoneMessage: 'WhatsApp tidak dikirim karena nomor WA mustahik belum diisi.',
        );

        return back()->with('success', 'Penyaluran zakat berhasil dicatat. '.$sendResult);
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

    private function collectionConfirmationMessage(ZakatCollection $collection): string
    {
        $receivedAt = $collection->received_at?->translatedFormat('d F Y') ?: '-';
        $details = array_filter([
            'Jenis: '.$this->zakatTypeLabel($collection->type),
            'Nominal: '.$this->zakatAmount($collection->money_amount, $collection->rice_amount),
            'Metode: '.$this->paymentMethodLabel($collection->payment_method),
            "Tanggal Terima: {$receivedAt}",
            'Status: '.$this->collectionStatusLabel($collection->status),
            filled($collection->notes) ? 'Catatan: '.$collection->notes : null,
        ]);

        return "Assalamu'alaikum warahmatullahi wabarakatuh.\n\n"
            ."Bapak/Ibu {$collection->muzakki_name}, penerimaan zakat Anda telah berhasil tercatat di sistem Masjid.\n\n"
            ."Detail Penerimaan:\n"
            .implode("\n", $details)."\n\n"
            ."Terima kasih, semoga zakat yang ditunaikan menjadi keberkahan dan diterima Allah SWT.\n\n"
            .'Jazakumullahu khairan.';
    }

    private function distributionConfirmationMessage(ZakatDistribution $distribution): string
    {
        $distributedAt = $distribution->distributed_at?->translatedFormat('d F Y') ?: '-';
        $details = array_filter([
            'Kategori: '.$this->mustahikCategoryLabel($distribution->mustahik_category),
            'Bantuan: '.$this->zakatAmount($distribution->money_amount, $distribution->rice_amount),
            "Tanggal Salur: {$distributedAt}",
            'Status: '.$this->distributionStatusLabel($distribution->status),
            filled($distribution->address) ? 'Alamat: '.$distribution->address : null,
            filled($distribution->notes) ? 'Catatan: '.$distribution->notes : null,
        ]);

        return "Assalamu'alaikum warahmatullahi wabarakatuh.\n\n"
            ."Bapak/Ibu {$distribution->mustahik_name}, penyaluran zakat untuk Anda telah berhasil tercatat di sistem Masjid.\n\n"
            ."Detail Penyaluran:\n"
            .implode("\n", $details)."\n\n"
            ."Informasi ini dikirim otomatis sebagai konfirmasi pencatatan penyaluran zakat.\n\n"
            .'Jazakumullahu khairan.';
    }

    private function zakatAmount(float|int|null $moneyAmount, float|int|null $riceAmount): string
    {
        $items = [];

        if ((float) $moneyAmount > 0) {
            $items[] = 'Rp'.number_format((float) $moneyAmount, 0, ',', '.');
        }

        if ((float) $riceAmount > 0) {
            $items[] = rtrim(rtrim(number_format((float) $riceAmount, 2, ',', '.'), '0'), ',').' kg beras';
        }

        return $items === [] ? '-' : implode(' + ', $items);
    }

    private function zakatTypeLabel(string $type): string
    {
        return match ($type) {
            'fitrah' => 'Zakat Fitrah',
            'maal' => 'Zakat Maal',
            'fidyah' => 'Fidyah',
            'infaq_zakat' => 'Infaq Zakat',
            default => 'Zakat',
        };
    }

    private function paymentMethodLabel(string $method): string
    {
        return match ($method) {
            'transfer' => 'Transfer',
            'qris' => 'QRIS',
            'rice' => 'Beras',
            default => 'Tunai',
        };
    }

    private function collectionStatusLabel(string $status): string
    {
        return match ($status) {
            'pending' => 'Pending',
            'cancelled' => 'Dibatalkan',
            default => 'Diterima',
        };
    }

    private function distributionStatusLabel(string $status): string
    {
        return match ($status) {
            'scheduled' => 'Terjadwal',
            'cancelled' => 'Dibatalkan',
            default => 'Tersalurkan',
        };
    }

    private function mustahikCategoryLabel(string $category): string
    {
        return match ($category) {
            'fakir_miskin' => 'Fakir/Miskin',
            'amil' => 'Amil',
            'gharim' => 'Gharim',
            'fisabilillah' => 'Fisabilillah',
            'ibnu_sabil' => 'Ibnu Sabil',
            default => 'Mustahik',
        };
    }
}
