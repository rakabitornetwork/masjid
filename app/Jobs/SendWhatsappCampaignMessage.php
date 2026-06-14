<?php

namespace App\Jobs;

use App\Models\WhatsappCampaign;
use App\Models\WhatsappCampaignRecipient;
use App\Models\WhatsappNotification;
use App\Services\WhatsappCloudApiService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendWhatsappCampaignMessage implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public function __construct(public int $recipientId)
    {
    }

    public function handle(WhatsappCloudApiService $whatsapp): void
    {
        $recipient = WhatsappCampaignRecipient::with('campaign')->find($this->recipientId);

        if (! $recipient || ! $recipient->campaign || $recipient->status !== 'queued') {
            return;
        }

        $campaign = $recipient->campaign;
        $recipient->update(['status' => 'sending']);
        $campaign->update(['status' => 'running']);

        $notification = WhatsappNotification::create([
            'title' => $campaign->title,
            'category' => $campaign->category,
            'recipient_name' => $recipient->recipient_name,
            'recipient_phone' => $recipient->recipient_phone,
            'message' => $campaign->message,
            'status' => 'draft',
            'scheduled_at' => $recipient->scheduled_at,
            'sent_at' => null,
            'notes' => 'Kampanye: '.$campaign->title,
        ]);

        try {
            $response = $whatsapp->sendText($recipient->recipient_phone, $campaign->message);
        } catch (\Throwable $exception) {
            $message = $whatsapp->sendErrorMessage($exception);

            $recipient->update([
                'whatsapp_notification_id' => $notification->id,
                'status' => 'failed',
                'sent_at' => null,
                'error_message' => $message,
            ]);

            $notification->update([
                'status' => 'failed',
                'notes' => trim($notification->notes."\nGagal mengirim: ".$message),
            ]);

            $this->refreshCampaignCounters($campaign);

            return;
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
            $recipient->update([
                'whatsapp_notification_id' => $notification->id,
                'status' => 'pending_review',
                'sent_at' => null,
                'error_message' => (string) data_get($response, 'message', 'Pesan belum terkonfirmasi terkirim.'),
            ]);

            $notification->update([
                'status' => 'pending_review',
                'sent_at' => null,
                'notes' => $notes,
            ]);

            $this->refreshCampaignCounters($campaign);

            return;
        }

        $recipient->update([
            'whatsapp_notification_id' => $notification->id,
            'status' => 'sent',
            'sent_at' => now(),
            'error_message' => null,
        ]);

        $notification->update([
            'status' => 'sent',
            'sent_at' => now(),
            'notes' => $notes,
        ]);

        $this->refreshCampaignCounters($campaign);
    }

    private function refreshCampaignCounters(WhatsappCampaign $campaign): void
    {
        $sent = $campaign->recipients()->where('status', 'sent')->count();
        $failed = $campaign->recipients()->where('status', 'failed')->count();
        $pendingReview = $campaign->recipients()->where('status', 'pending_review')->count();
        $remaining = $campaign->recipients()->whereIn('status', ['queued', 'sending'])->count();

        $campaign->update([
            'sent_count' => $sent,
            'failed_count' => $failed,
            'pending_review_count' => $pendingReview,
            'status' => $remaining > 0
                ? 'running'
                : (($failed + $pendingReview) > 0 ? 'completed_with_errors' : 'completed'),
        ]);
    }
}
