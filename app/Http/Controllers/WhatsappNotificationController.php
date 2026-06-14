<?php

namespace App\Http\Controllers;

use App\Models\WhatsappNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WhatsappNotificationController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('WhatsappNotifications/Index', [
            'notifications' => WhatsappNotification::latest('scheduled_at')->latest()->get(),
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
