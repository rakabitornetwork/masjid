<?php

namespace App\Http\Controllers;

use App\Services\WhatsappCloudApiService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class WhatsappGatewayController extends Controller
{
    public function index(WhatsappCloudApiService $whatsapp): Response
    {
        return Inertia::render('System/WhatsappGateway', [
            'provider' => [
                'key' => $whatsapp->provider(),
                'label' => $whatsapp->providerLabel(),
                'enabled' => $whatsapp->isConfigured(),
                'baseUrl' => config('services.whatsapp.baileys_base_url'),
            ],
            'health' => $whatsapp->gatewayStatus(),
            'qr' => $whatsapp->gatewayQr(),
        ]);
    }

    public function restart(WhatsappCloudApiService $whatsapp): RedirectResponse
    {
        $result = $whatsapp->restartGateway();

        return back()->with($result['ok'] ? 'success' : 'error', $result['message']);
    }

    public function logoutSession(WhatsappCloudApiService $whatsapp): RedirectResponse
    {
        $result = $whatsapp->logoutGatewaySession();

        return back()->with($result['ok'] ? 'success' : 'error', $result['message']);
    }
}
