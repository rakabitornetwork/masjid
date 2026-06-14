<?php

namespace App\Services;

use App\Models\WhatsappNotification;
use Throwable;

class AutomatedWhatsappNotificationService
{
    public function __construct(private readonly WhatsappCloudApiService $whatsapp) {}

    /**
     * @return array{enabled: bool, provider: string}
     */
    public function gatewayInfo(): array
    {
        return [
            'enabled' => $this->whatsapp->isConfigured(),
            'provider' => $this->whatsapp->providerLabel(),
        ];
    }

    public function send(
        string $title,
        string $category,
        string $recipientName,
        ?string $recipientPhone,
        string $message,
        string $sourceNotes,
        string $missingPhoneMessage = 'WhatsApp tidak dikirim karena nomor WA belum diisi.',
    ): string {
        if (! filled($recipientPhone)) {
            return $missingPhoneMessage;
        }

        if (! $this->whatsapp->isConfigured()) {
            return 'WhatsApp tidak dikirim karena gateway belum aktif.';
        }

        $notification = WhatsappNotification::create([
            'title' => $title,
            'category' => $category,
            'recipient_name' => $recipientName,
            'recipient_phone' => $recipientPhone,
            'message' => $message,
            'status' => 'draft',
            'scheduled_at' => null,
            'sent_at' => null,
            'notes' => $sourceNotes,
        ]);

        try {
            $response = $this->whatsapp->sendText($recipientPhone, $message);
        } catch (Throwable $exception) {
            $errorMessage = $this->whatsapp->sendErrorMessage($exception);

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
                ? $this->whatsapp->providerLabel().' message_id: '.$messageId
                : $this->whatsapp->providerLabel().' berhasil mengirim pesan.',
            $syncWarning ? 'Peringatan: pesan diterima server tetapi belum terbukti tersinkron ke HP gateway.' : null,
        ])));

        if ($this->whatsapp->provider() === 'baileys' && (! $deliveryConfirmed || $syncWarning)) {
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
}
