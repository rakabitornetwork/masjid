<?php

namespace App\Http\Controllers;

use App\Models\QurbanParticipant;
use App\Services\AutomatedWhatsappNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QurbanParticipantController extends Controller
{
    public function index(AutomatedWhatsappNotificationService $whatsapp): Response
    {
        return Inertia::render('Qurban/Index', [
            'participants' => QurbanParticipant::latest('registered_at')->latest()->get(),
            'api' => $whatsapp->gatewayInfo(),
            'summary' => [
                'total' => QurbanParticipant::count(),
                'goat' => QurbanParticipant::where('animal_type', 'goat')->count(),
                'cowShares' => QurbanParticipant::where('animal_type', 'cow')->sum('share_count'),
                'paid' => (float) QurbanParticipant::sum('amount_paid'),
            ],
        ]);
    }

    public function store(Request $request, AutomatedWhatsappNotificationService $whatsapp): RedirectResponse
    {
        $participant = QurbanParticipant::create($this->validatedData($request));

        if (! $request->boolean('send_whatsapp')) {
            return back()->with('success', 'Data qurban berhasil ditambahkan.');
        }

        $sendResult = $whatsapp->send(
            title: 'Konfirmasi Data Qurban',
            category: 'qurban',
            recipientName: $participant->participant_name,
            recipientPhone: $participant->phone,
            message: $this->qurbanConfirmationMessage($participant),
            sourceNotes: 'Dibuat otomatis dari form Qurban.',
            missingPhoneMessage: 'WhatsApp tidak dikirim karena nomor WA pekurban belum diisi.',
        );

        return back()->with('success', 'Data qurban berhasil ditambahkan. '.$sendResult);
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

    private function qurbanConfirmationMessage(QurbanParticipant $participant): string
    {
        $registeredAt = $participant->registered_at?->translatedFormat('d F Y') ?: '-';
        $animal = $participant->animal_type === 'cow'
            ? "Sapi ({$participant->share_count} saham)"
            : 'Kambing';
        $targetAmount = $participant->target_amount > 0
            ? 'Rp'.number_format((float) $participant->target_amount, 0, ',', '.')
            : '-';
        $amountPaid = $participant->amount_paid > 0
            ? 'Rp'.number_format((float) $participant->amount_paid, 0, ',', '.')
            : '-';
        $slaughteredAt = $participant->slaughtered_at?->translatedFormat('d F Y') ?: '-';
        $details = array_filter([
            "Jenis Qurban: {$animal}",
            filled($participant->group_name) ? 'Kelompok/Sapi: '.$participant->group_name : null,
            "Tanggal Daftar: {$registeredAt}",
            "Tanggal Sembelih: {$slaughteredAt}",
            "Target Biaya: {$targetAmount}",
            "Sudah Dibayar: {$amountPaid}",
            'Status Pembayaran: '.$this->paymentStatusLabel($participant->payment_status),
            'Status Qurban: '.$this->slaughterStatusLabel($participant->slaughter_status),
            filled($participant->distribution_notes) ? 'Catatan Distribusi: '.$participant->distribution_notes : null,
            filled($participant->notes) ? 'Catatan: '.$participant->notes : null,
        ]);

        return "Assalamu'alaikum warahmatullahi wabarakatuh.\n\n"
            ."Bapak/Ibu {$participant->participant_name}, data qurban Anda telah berhasil tercatat di sistem Masjid.\n\n"
            ."Detail Qurban:\n"
            .implode("\n", $details)."\n\n"
            ."Terima kasih atas partisipasi qurban Anda. Informasi ini dikirim otomatis sebagai konfirmasi pencatatan data.\n\n"
            .'Jazakumullahu khairan.';
    }

    private function paymentStatusLabel(string $status): string
    {
        return match ($status) {
            'paid' => 'Lunas',
            'partial' => 'Sebagian',
            default => 'Belum Bayar',
        };
    }

    private function slaughterStatusLabel(string $status): string
    {
        return match ($status) {
            'ready' => 'Siap Disembelih',
            'slaughtered' => 'Disembelih',
            'distributed' => 'Dibagikan',
            default => 'Terdaftar',
        };
    }
}
