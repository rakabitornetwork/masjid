<?php

namespace App\Http\Controllers;

use App\Models\WhatsappNotification;
use App\Services\WhatsappCloudApiService;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class WhatsappNotificationController extends Controller
{
    public function index(WhatsappCloudApiService $whatsapp): Response
    {
        return Inertia::render('WhatsappNotifications/Index', [
            'notifications' => WhatsappNotification::latest('scheduled_at')->latest()->get(),
            'api' => [
                'enabled' => $whatsapp->isConfigured(),
                'provider' => 'Meta WhatsApp Cloud API',
            ],
            'summary' => [
                'total' => WhatsappNotification::count(),
                'draft' => WhatsappNotification::where('status', 'draft')->count(),
                'scheduled' => WhatsappNotification::where('status', 'scheduled')->count(),
                'sent' => WhatsappNotification::where('status', 'sent')->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        WhatsappNotification::create($this->validatedData($request));

        return back()->with('success', 'Notifikasi WhatsApp berhasil ditambahkan.');
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
        try {
            $response = $whatsapp->sendText($whatsappNotification->recipient_phone, $whatsappNotification->message);
        } catch (RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        } catch (RequestException $exception) {
            return back()->with('error', 'WhatsApp API gagal mengirim pesan: '.($exception->response?->body() ?: $exception->getMessage()));
        }

        $messageId = data_get($response, 'messages.0.id');
        $notes = trim(implode("\n", array_filter([
            $whatsappNotification->notes,
            $messageId ? 'WhatsApp API message_id: '.$messageId : 'WhatsApp API berhasil mengirim pesan.',
        ])));

        $whatsappNotification->update([
            'status' => 'sent',
            'sent_at' => now(),
            'notes' => $notes,
        ]);

        return back()->with('success', 'Notifikasi WhatsApp berhasil dikirim melalui API.');
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
            'status' => ['required', 'in:draft,scheduled,sent,cancelled'],
            'scheduled_at' => ['nullable', 'date'],
            'sent_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);
    }
}
