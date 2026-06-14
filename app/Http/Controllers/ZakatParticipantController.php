<?php

namespace App\Http\Controllers;

use App\Models\ZakatParticipant;
use App\Services\AutomatedWhatsappNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ZakatParticipantController extends Controller
{
    public function index(AutomatedWhatsappNotificationService $whatsapp): Response
    {
        return Inertia::render('ZakatParticipants/Index', [
            'participants' => ZakatParticipant::latest()->get(),
            'api' => $whatsapp->gatewayInfo(),
            'summary' => [
                'total' => ZakatParticipant::count(),
                'active' => ZakatParticipant::where('is_active', true)->count(),
                'muzakki' => ZakatParticipant::whereIn('role', ['muzakki', 'both'])->count(),
                'mustahikFamilies' => (int) ZakatParticipant::whereIn('role', ['mustahik', 'both'])->sum('family_count'),
            ],
        ]);
    }

    public function store(Request $request, AutomatedWhatsappNotificationService $whatsapp): RedirectResponse
    {
        $participant = ZakatParticipant::create($this->validatedData($request));

        if (! $request->boolean('send_whatsapp')) {
            return back()->with('success', 'Data muzakki/mustahik berhasil ditambahkan.');
        }

        $sendResult = $whatsapp->send(
            title: 'Konfirmasi Data Muzakki/Mustahik',
            category: 'zakat',
            recipientName: $participant->name,
            recipientPhone: $participant->phone,
            message: $this->registrationMessage($participant),
            sourceNotes: 'Dibuat otomatis dari form Muzakki & Mustahik.',
        );

        return back()->with('success', 'Data muzakki/mustahik berhasil ditambahkan. '.$sendResult);
    }

    public function update(Request $request, ZakatParticipant $zakatParticipant): RedirectResponse
    {
        $zakatParticipant->update($this->validatedData($request));

        return back()->with('success', 'Data muzakki/mustahik berhasil diperbarui.');
    }

    public function destroy(ZakatParticipant $zakatParticipant): RedirectResponse
    {
        $zakatParticipant->delete();

        return back()->with('success', 'Data muzakki/mustahik berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request): array
    {
        $data = $request->validate([
            'role' => ['required', 'in:muzakki,mustahik,both'],
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'identity_number' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string'],
            'family_count' => ['nullable', 'integer', 'min:1', 'max:999'],
            'muzakki_type' => ['nullable', 'string', 'max:50'],
            'mustahik_category' => ['nullable', 'string', 'max:100'],
            'occupation' => ['nullable', 'string', 'max:100'],
            'income_range' => ['nullable', 'string', 'max:100'],
            'is_active' => ['boolean'],
            'notes' => ['nullable', 'string'],
        ]);

        $data['family_count'] = (int) (($data['family_count'] ?? null) ?: 1);
        $data['is_active'] = (bool) ($data['is_active'] ?? false);

        return $data;
    }

    private function registrationMessage(ZakatParticipant $participant): string
    {
        $role = match ($participant->role) {
            'muzakki' => 'Muzakki',
            'mustahik' => 'Mustahik',
            default => 'Muzakki & Mustahik',
        };
        $details = array_filter([
            "Jenis Data: {$role}",
            'Status Data: '.($participant->is_active ? 'Aktif' : 'Nonaktif'),
            "Jumlah Keluarga: {$participant->family_count} orang",
            in_array($participant->role, ['muzakki', 'both'], true) ? 'Tipe Muzakki: '.$this->muzakkiTypeLabel((string) $participant->muzakki_type) : null,
            in_array($participant->role, ['mustahik', 'both'], true) ? 'Kategori Mustahik: '.$this->mustahikCategoryLabel((string) $participant->mustahik_category) : null,
            filled($participant->occupation) ? 'Pekerjaan: '.$participant->occupation : null,
            filled($participant->income_range) ? 'Rentang Penghasilan: '.$this->incomeRangeLabel((string) $participant->income_range) : null,
            filled($participant->address) ? 'Alamat: '.$participant->address : null,
            filled($participant->notes) ? 'Catatan: '.$participant->notes : null,
        ]);

        return "Assalamu'alaikum warahmatullahi wabarakatuh.\n\n"
            ."Bapak/Ibu {$participant->name}, data Anda sebagai {$role} telah berhasil terdaftar di sistem Masjid.\n\n"
            ."Detail Data:\n"
            .implode("\n", $details)."\n\n"
            ."Informasi ini dikirim otomatis sebagai konfirmasi pencatatan data. Jika ada kekeliruan data, silakan menghubungi pengurus masjid.\n\n"
            .'Jazakumullahu khairan.';
    }

    private function muzakkiTypeLabel(string $type): string
    {
        return match ($type) {
            'family' => 'Keluarga',
            'business' => 'Usaha/Perusahaan',
            'institution' => 'Lembaga',
            default => 'Perorangan',
        };
    }

    private function mustahikCategoryLabel(string $category): string
    {
        return match ($category) {
            'fakir_miskin' => 'Fakir/Miskin',
            'amil' => 'Amil',
            'muallaf' => 'Muallaf',
            'gharim' => 'Gharim',
            'fisabilillah' => 'Fisabilillah',
            'ibnu_sabil' => 'Ibnu Sabil',
            default => 'Lainnya',
        };
    }

    private function incomeRangeLabel(string $range): string
    {
        return match ($range) {
            'under_1m' => '< Rp1 juta',
            '1m_3m' => 'Rp1 juta - Rp3 juta',
            '3m_5m' => 'Rp3 juta - Rp5 juta',
            'above_5m' => '> Rp5 juta',
            default => 'Belum diisi',
        };
    }
}
