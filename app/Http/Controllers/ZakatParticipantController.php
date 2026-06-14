<?php

namespace App\Http\Controllers;

use App\Models\ZakatParticipant;
use App\Models\WhatsappNotification;
use App\Services\WhatsappCloudApiService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ZakatParticipantController extends Controller
{
    public function index(WhatsappCloudApiService $whatsapp): Response
    {
        return Inertia::render('ZakatParticipants/Index', [
            'participants' => ZakatParticipant::latest()->get(),
            'api' => [
                'enabled' => $whatsapp->isConfigured(),
                'provider' => $whatsapp->providerLabel(),
            ],
            'summary' => [
                'total' => ZakatParticipant::count(),
                'active' => ZakatParticipant::where('is_active', true)->count(),
                'muzakki' => ZakatParticipant::whereIn('role', ['muzakki', 'both'])->count(),
                'mustahikFamilies' => (int) ZakatParticipant::whereIn('role', ['mustahik', 'both'])->sum('family_count'),
            ],
        ]);
    }

    public function store(Request $request, WhatsappCloudApiService $whatsapp): RedirectResponse
    {
        $participant = ZakatParticipant::create($this->validatedData($request));

        if (! $request->boolean('send_whatsapp')) {
            return back()->with('success', 'Data muzakki/mustahik berhasil ditambahkan.');
        }

        $sendResult = $this->sendRegistrationNotification($participant, $whatsapp);

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

    private function sendRegistrationNotification(ZakatParticipant $participant, WhatsappCloudApiService $whatsapp): string
    {
        if (! filled($participant->phone)) {
            return 'WhatsApp tidak dikirim karena nomor WA belum diisi.';
        }

        if (! $whatsapp->isConfigured()) {
            return 'WhatsApp tidak dikirim karena gateway belum aktif.';
        }

        $message = $this->registrationMessage($participant);
        $notification = WhatsappNotification::create([
            'title' => 'Konfirmasi Data Muzakki/Mustahik',
            'category' => 'zakat',
            'recipient_name' => $participant->name,
            'recipient_phone' => $participant->phone,
            'message' => $message,
            'status' => 'draft',
            'scheduled_at' => null,
            'sent_at' => null,
            'notes' => 'Dibuat otomatis dari form Muzakki & Mustahik.',
        ]);

        try {
            $response = $whatsapp->sendText($participant->phone, $message);
        } catch (\Throwable $exception) {
            $errorMessage = $whatsapp->sendErrorMessage($exception);

            $notification->update([
                'status' => 'failed',
                'notes' => trim($notification->notes."\nGagal mengirim: ".$errorMessage),
            ]);

            return 'WhatsApp gagal dikirim: '.$errorMessage;
        }

        $messageId = data_get($response, 'messages.0.id') ?: data_get($response, 'data.message_id');
        $deliveryConfirmed = (bool) data_get($response, 'data.delivery_confirmed', true);
        $syncWarning = (bool) data_get($response, 'data.sync_warning', false);
        $notes = trim(implode("\n", array_filter([
            $notification->notes,
            $messageId
                ? $whatsapp->providerLabel().' message_id: '.$messageId
                : $whatsapp->providerLabel().' berhasil mengirim pesan.',
            $syncWarning ? 'Peringatan: pesan diterima server tetapi belum terbukti tersinkron ke HP gateway.' : null,
        ])));

        if ($whatsapp->provider() === 'baileys' && (! $deliveryConfirmed || $syncWarning)) {
            $notification->update([
                'status' => 'pending_review',
                'sent_at' => null,
                'notes' => $notes,
            ]);

            return 'WhatsApp masuk riwayat dengan status perlu dicek.';
        }

        $notification->update([
            'status' => 'sent',
            'sent_at' => now(),
            'notes' => $notes,
        ]);

        return 'WhatsApp konfirmasi berhasil dikirim.';
    }

    private function registrationMessage(ZakatParticipant $participant): string
    {
        $role = match ($participant->role) {
            'muzakki' => 'Muzakki',
            'mustahik' => 'Mustahik',
            default => 'Muzakki & Mustahik',
        };

        return "Assalamu'alaikum warahmatullahi wabarakatuh.\n\n"
            ."Bapak/Ibu {$participant->name}, data Anda sebagai {$role} telah berhasil terdaftar di sistem Masjid.\n\n"
            ."Informasi ini dikirim otomatis sebagai konfirmasi pencatatan data. Jika ada kekeliruan data, silakan menghubungi pengurus masjid.\n\n"
            .'Jazakumullahu khairan.';
    }
}
