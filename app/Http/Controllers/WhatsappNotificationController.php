<?php

namespace App\Http\Controllers;

use App\Jobs\SendWhatsappCampaignMessage;
use App\Models\Congregant;
use App\Models\WhatsappCampaign;
use App\Models\WhatsappNotification;
use App\Services\WhatsappCloudApiService;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class WhatsappNotificationController extends Controller
{
    public function index(WhatsappCloudApiService $whatsapp): Response
    {
        return Inertia::render('WhatsappNotifications/Index', [
            'notifications' => WhatsappNotification::latest()->get()
                ->map(fn (WhatsappNotification $notification): array => [
                    ...$notification->toArray(),
                    'created_at_display' => $notification->created_at?->format('d M Y H:i'),
                    'sent_at_display' => $notification->sent_at?->format('d M Y H:i'),
                ]),
            'campaigns' => WhatsappCampaign::with(['recipients' => fn ($query) => $query->orderBy('sequence')])
                ->latest()
                ->take(15)
                ->get()
                ->map(fn (WhatsappCampaign $campaign): array => [
                    ...$campaign->toArray(),
                    'created_at_display' => $campaign->created_at?->format('d M Y H:i'),
                    'starts_at_display' => $campaign->starts_at?->format('d M Y H:i'),
                    'recipients' => $campaign->recipients->map(fn ($recipient): array => [
                        ...$recipient->toArray(),
                        'scheduled_at_display' => $recipient->scheduled_at?->format('d M Y H:i'),
                        'sent_at_display' => $recipient->sent_at?->format('d M Y H:i'),
                    ]),
                ]),
            'congregants' => Congregant::whereNotNull('phone')
                ->where('phone', '!=', '')
                ->orderByDesc('is_active')
                ->orderBy('name')
                ->get(['id', 'name', 'phone', 'neighborhood', 'gender', 'is_active']),
            'broadcastFilters' => [
                'neighborhoods' => Congregant::whereNotNull('neighborhood')
                    ->where('neighborhood', '!=', '')
                    ->distinct()
                    ->orderBy('neighborhood')
                    ->pluck('neighborhood'),
            ],
            'api' => [
                'enabled' => $whatsapp->isConfigured(),
                'provider' => $whatsapp->providerLabel(),
                'provider_key' => $whatsapp->provider(),
            ],
            'summary' => [
                'total' => WhatsappNotification::count(),
                'sent' => WhatsappNotification::where('status', 'sent')->count(),
                'failed' => WhatsappNotification::where('status', 'failed')->count(),
                'pending_review' => WhatsappNotification::where('status', 'pending_review')->count(),
                'campaigns' => WhatsappCampaign::count(),
            ],
        ]);
    }

    public function store(Request $request, WhatsappCloudApiService $whatsapp): RedirectResponse
    {
        $notification = WhatsappNotification::create([
            ...$this->validatedData($request),
            'status' => 'draft',
            'scheduled_at' => null,
            'sent_at' => null,
        ]);

        return $this->sendNotification($notification, $whatsapp);
    }

    public function update(Request $request, WhatsappNotification $whatsappNotification): RedirectResponse
    {
        $whatsappNotification->update($this->validatedData($request));

        return back()->with('success', 'Notifikasi WhatsApp berhasil diperbarui.');
    }

    public function destroy(WhatsappNotification $whatsappNotification): RedirectResponse
    {
        $whatsappNotification->delete();

        return back()->with('success', 'Notifikasi WhatsApp berhasil dihapus.');
    }

    public function markSent(WhatsappNotification $whatsappNotification): RedirectResponse
    {
        $whatsappNotification->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        return back()->with('success', 'Notifikasi WhatsApp ditandai sudah terkirim.');
    }

    public function sendApi(WhatsappNotification $whatsappNotification, WhatsappCloudApiService $whatsapp): RedirectResponse
    {
        return $this->sendNotification($whatsappNotification, $whatsapp);
    }

    public function storeCampaign(Request $request, WhatsappCloudApiService $whatsapp): RedirectResponse
    {
        if (! $whatsapp->isConfigured()) {
            return back()->with('error', 'WhatsApp API belum aktif atau konfigurasi .env belum lengkap.');
        }

        $data = $this->validatedCampaignData($request);
        $recipients = $this->campaignRecipients($data);

        if ($recipients->isEmpty()) {
            return back()->with('error', 'Tidak ada jamaah aktif dengan nomor WhatsApp yang cocok dengan pilihan broadcast.');
        }

        if ($recipients->count() > 100) {
            return back()->with('error', 'Broadcast dibatasi maksimal 100 nomor per kampanye. Persempit filter atau buat beberapa kampanye.');
        }

        $startAt = filled($data['starts_at'] ?? null)
            ? Carbon::parse($data['starts_at'])
            : now();

        $campaign = WhatsappCampaign::create([
            'title' => $data['title'],
            'category' => $data['category'],
            'message' => $data['message'],
            'interval_minutes' => $data['interval_minutes'],
            'starts_at' => $startAt,
            'status' => 'queued',
            'total_recipients' => $recipients->count(),
            'filters' => [
                'mode' => $data['recipient_mode'],
                'selected_count' => count($data['congregant_ids'] ?? []),
                'neighborhood' => $data['neighborhood'] ?? null,
                'gender' => $data['gender'] ?? null,
                'active_only' => (bool) ($data['active_only'] ?? true),
            ],
            'notes' => $data['notes'] ?? null,
        ]);

        $recipients->values()->each(function (Congregant $congregant, int $index) use ($campaign, $startAt, $data): void {
            $scheduledAt = $startAt->copy()->addMinutes($index * (int) $data['interval_minutes']);
            $recipient = $campaign->recipients()->create([
                'congregant_id' => $congregant->id,
                'recipient_name' => $congregant->name,
                'recipient_phone' => $this->normalizePhone($congregant->phone),
                'sequence' => $index + 1,
                'status' => 'queued',
                'scheduled_at' => $scheduledAt,
            ]);

            SendWhatsappCampaignMessage::dispatch($recipient->id)->delay($scheduledAt);
        });

        return back()->with('success', sprintf(
            'Broadcast "%s" dibuat untuk %d jamaah. Pengiriman berjalan bertahap setiap %d menit.',
            $campaign->title,
            $campaign->total_recipients,
            $campaign->interval_minutes
        ));
    }

    private function sendNotification(WhatsappNotification $whatsappNotification, WhatsappCloudApiService $whatsapp): RedirectResponse
    {
        try {
            $response = $whatsapp->sendText($whatsappNotification->recipient_phone, $whatsappNotification->message);
        } catch (RuntimeException $exception) {
            $message = $whatsapp->sendErrorMessage($exception);
            $this->markFailed($whatsappNotification, $message);

            return back()->with('error', $message);
        } catch (RequestException $exception) {
            $message = $whatsapp->sendErrorMessage($exception);
            $this->markFailed($whatsappNotification, $message);

            return back()->with('error', $message);
        }

        $messageId = data_get($response, 'messages.0.id') ?: data_get($response, 'data.message_id');
        $deliveryConfirmed = (bool) data_get($response, 'data.delivery_confirmed', true);
        $syncWarning = (bool) data_get($response, 'data.sync_warning', false);
        $notes = trim(implode("\n", array_filter([
            $whatsappNotification->notes,
            $messageId
                ? $whatsapp->providerLabel().' message_id: '.$messageId
                : $whatsapp->providerLabel().' berhasil mengirim pesan.',
            $syncWarning ? 'Peringatan: pesan diterima server tetapi belum terbukti tersinkron ke HP gateway.' : null,
        ])));

        if ($whatsapp->provider() === 'baileys' && (! $deliveryConfirmed || $syncWarning)) {
            $whatsappNotification->update([
                'status' => 'pending_review',
                'sent_at' => null,
                'notes' => $notes,
            ]);

            return back()->with('error', (string) data_get($response, 'message', 'Pesan belum terkonfirmasi terkirim. Coba kirim ulang atau cek Gateway WA.'));
        }

        $whatsappNotification->update([
            'status' => 'sent',
            'sent_at' => now(),
            'notes' => $notes,
        ]);

        return back()->with('success', 'Notifikasi WhatsApp berhasil dikirim melalui '.$whatsapp->providerLabel().'.');
    }

    private function markFailed(WhatsappNotification $whatsappNotification, string $message): void
    {
        $existingNotes = collect(preg_split('/\r\n|\r|\n/', (string) $whatsappNotification->notes))
            ->map(fn (string $line): string => trim($line))
            ->filter()
            ->reject(fn (string $line): bool => str_starts_with($line, 'Gagal mengirim:'))
            ->values()
            ->all();

        $whatsappNotification->update([
            'status' => 'failed',
            'sent_at' => null,
            'notes' => trim(implode("\n", array_filter([
                ...$existingNotes,
                'Gagal mengirim: '.$message,
            ]))),
        ]);
    }

    private function campaignRecipients(array $data): \Illuminate\Support\Collection
    {
        $selected = collect();
        $ids = array_filter($data['congregant_ids'] ?? []);

        if (in_array($data['recipient_mode'], ['selected', 'both'], true) && $ids !== []) {
            $selected = Congregant::whereIn('id', $ids)
                ->whereNotNull('phone')
                ->where('phone', '!=', '')
                ->get();
        }

        $filtered = collect();

        if (in_array($data['recipient_mode'], ['filter', 'both'], true)) {
            $query = Congregant::query()
                ->whereNotNull('phone')
                ->where('phone', '!=', '');

            if ((bool) ($data['active_only'] ?? true)) {
                $query->where('is_active', true);
            }

            if (filled($data['neighborhood'] ?? null)) {
                $query->where('neighborhood', $data['neighborhood']);
            }

            if (filled($data['gender'] ?? null)) {
                $query->where('gender', $data['gender']);
            }

            $filtered = $query->orderBy('name')->get();
        }

        return $selected
            ->concat($filtered)
            ->filter(fn (Congregant $congregant): bool => filled($this->normalizePhone($congregant->phone)))
            ->unique(fn (Congregant $congregant): string => $this->normalizePhone($congregant->phone))
            ->sortBy('name')
            ->values();
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedCampaignData(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'in:general,schedule,booking,donation,zakat,qurban,finance,announcement'],
            'message' => ['required', 'string'],
            'recipient_mode' => ['required', 'in:selected,filter,both'],
            'congregant_ids' => ['nullable', 'array'],
            'congregant_ids.*' => ['integer', 'exists:congregants,id'],
            'neighborhood' => ['nullable', 'string', 'max:50'],
            'gender' => ['nullable', 'in:male,female'],
            'active_only' => ['boolean'],
            'interval_minutes' => ['required', 'integer', 'min:5', 'max:1440'],
            'starts_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);
    }

    private function normalizePhone(?string $phone): string
    {
        $digits = preg_replace('/\D+/', '', (string) $phone) ?: '';

        if (str_starts_with($digits, '0')) {
            return '62'.substr($digits, 1);
        }

        return $digits;
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'in:general,schedule,booking,donation,zakat,qurban,finance,announcement'],
            'recipient_name' => ['required', 'string', 'max:255'],
            'recipient_phone' => ['required', 'string', 'max:50'],
            'message' => ['required', 'string'],
            'notes' => ['nullable', 'string'],
        ]);
    }
}
