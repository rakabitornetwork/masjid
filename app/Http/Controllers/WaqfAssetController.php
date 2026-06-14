<?php

namespace App\Http\Controllers;

use App\Models\WaqfAsset;
use App\Services\AutomatedWhatsappNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WaqfAssetController extends Controller
{
    public function index(AutomatedWhatsappNotificationService $whatsapp): Response
    {
        return Inertia::render('WaqfAssets/Index', [
            'assets' => WaqfAsset::latest('received_at')->latest()->get(),
            'api' => $whatsapp->gatewayInfo(),
            'summary' => [
                'total' => WaqfAsset::count(),
                'managed' => WaqfAsset::where('status', 'managed')->count(),
                'productive' => WaqfAsset::where('status', 'productive')->count(),
                'value' => (float) WaqfAsset::sum('estimated_value'),
            ],
        ]);
    }

    public function store(Request $request, AutomatedWhatsappNotificationService $whatsapp): RedirectResponse
    {
        $asset = WaqfAsset::create($this->validatedData($request));

        if (! $request->boolean('send_whatsapp')) {
            return back()->with('success', 'Data wakaf berhasil ditambahkan.');
        }

        $sendResult = $whatsapp->send(
            title: 'Konfirmasi Data Wakaf',
            category: 'wakaf',
            recipientName: $asset->wakif_name,
            recipientPhone: $asset->wakif_phone,
            message: $this->waqfConfirmationMessage($asset),
            sourceNotes: 'Dibuat otomatis dari form Wakaf.',
            missingPhoneMessage: 'WhatsApp tidak dikirim karena nomor WA wakif belum diisi.',
        );

        return back()->with('success', 'Data wakaf berhasil ditambahkan. '.$sendResult);
    }

    public function update(Request $request, WaqfAsset $waqfAsset): RedirectResponse
    {
        $waqfAsset->update($this->validatedData($request));

        return back()->with('success', 'Data wakaf berhasil diperbarui.');
    }

    public function destroy(WaqfAsset $waqfAsset): RedirectResponse
    {
        $waqfAsset->delete();

        return back()->with('success', 'Data wakaf berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request): array
    {
        return $request->validate([
            'wakif_name' => ['required', 'string', 'max:255'],
            'wakif_phone' => ['nullable', 'string', 'max:50'],
            'asset_name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'in:cash,land,building,equipment,vehicle,book,other'],
            'description' => ['nullable', 'string'],
            'estimated_value' => ['nullable', 'numeric', 'min:0'],
            'received_at' => ['nullable', 'date'],
            'certificate_number' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:pledged,managed,productive,maintenance,sold,replaced'],
            'notes' => ['nullable', 'string'],
        ]);
    }

    private function waqfConfirmationMessage(WaqfAsset $asset): string
    {
        $receivedAt = $asset->received_at?->translatedFormat('d F Y') ?: '-';
        $estimatedValue = $asset->estimated_value > 0
            ? 'Rp'.number_format((float) $asset->estimated_value, 0, ',', '.')
            : '-';
        $details = array_filter([
            "Nama Wakaf: {$asset->asset_name}",
            'Kategori: '.$this->categoryLabel($asset->category),
            'Status: '.$this->statusLabel($asset->status),
            "Tanggal Terima: {$receivedAt}",
            "Nilai Estimasi: {$estimatedValue}",
            filled($asset->location) ? 'Lokasi: '.$asset->location : null,
            filled($asset->certificate_number) ? 'Nomor Sertifikat: '.$asset->certificate_number : null,
            filled($asset->description) ? 'Deskripsi: '.$asset->description : null,
            filled($asset->notes) ? 'Catatan: '.$asset->notes : null,
        ]);

        return "Assalamu'alaikum warahmatullahi wabarakatuh.\n\n"
            ."Bapak/Ibu {$asset->wakif_name}, wakaf Anda telah berhasil tercatat di sistem Masjid.\n\n"
            ."Detail Wakaf:\n"
            .implode("\n", $details)."\n\n"
            ."Terima kasih atas amanah wakaf yang diberikan. Semoga menjadi amal jariyah yang terus mengalir pahalanya.\n\n"
            .'Jazakumullahu khairan.';
    }

    private function categoryLabel(string $category): string
    {
        return match ($category) {
            'cash' => 'Uang',
            'land' => 'Tanah',
            'building' => 'Bangunan',
            'equipment' => 'Peralatan',
            'vehicle' => 'Kendaraan',
            'book' => 'Kitab/Buku',
            default => 'Lainnya',
        };
    }

    private function statusLabel(string $status): string
    {
        return match ($status) {
            'pledged' => 'Ikrar',
            'managed' => 'Dikelola',
            'productive' => 'Produktif',
            'maintenance' => 'Perawatan',
            'sold' => 'Dijual',
            'replaced' => 'Diganti',
            default => 'Dikelola',
        };
    }
}
