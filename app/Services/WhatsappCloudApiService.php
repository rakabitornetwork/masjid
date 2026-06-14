<?php

namespace App\Services;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class WhatsappCloudApiService
{
    /**
     * @return array<string, mixed>
     *
     * @throws RequestException
     */
    public function sendText(string $phone, string $message): array
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException('WhatsApp API belum aktif atau konfigurasi .env belum lengkap.');
        }

        return match ($this->provider()) {
            'baileys' => $this->sendViaBaileys($phone, $message),
            default => $this->sendViaMeta($phone, $message),
        };
    }

    public function isConfigured(): bool
    {
        if (! (bool) config('services.whatsapp.enabled')) {
            return false;
        }

        return match ($this->provider()) {
            'baileys' => filled(config('services.whatsapp.baileys_base_url'))
                && filled(config('services.whatsapp.baileys_token')),
            default => filled(config('services.whatsapp.phone_number_id'))
                && filled(config('services.whatsapp.access_token')),
        };
    }

    public function provider(): string
    {
        return strtolower((string) config('services.whatsapp.provider', 'meta'));
    }

    public function providerLabel(): string
    {
        return match ($this->provider()) {
            'baileys' => 'Baileys Gateway Masjid',
            default => 'Meta WhatsApp Cloud API',
        };
    }

    /**
     * @return array<string, mixed>
     */
    public function gatewayStatus(): array
    {
        if ($this->provider() !== 'baileys') {
            return [
                'ok' => false,
                'message' => 'Provider WhatsApp aktif bukan Baileys Gateway.',
            ];
        }

        try {
            $response = Http::baseUrl(rtrim((string) config('services.whatsapp.baileys_base_url'), '/'))
                ->acceptJson()
                ->timeout((int) config('services.whatsapp.baileys_timeout', 20))
                ->get('/health');

            return [
                'ok' => $response->successful(),
                'status' => $response->status(),
                'message' => $response->successful() ? 'Gateway dapat dijangkau.' : 'Gateway merespons HTTP '.$response->status().'.',
                'data' => $response->json() ?: [],
            ];
        } catch (\Throwable $exception) {
            return [
                'ok' => false,
                'message' => $exception->getMessage(),
                'data' => [],
            ];
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function gatewayQr(): array
    {
        if (! $this->isConfigured() || $this->provider() !== 'baileys') {
            return [
                'ok' => false,
                'message' => 'Baileys Gateway belum aktif atau konfigurasi .env belum lengkap.',
            ];
        }

        try {
            $response = $this->baileysClient()->get('/qr');

            return [
                'ok' => $response->successful(),
                'status' => $response->status(),
                'message' => $response->successful() ? (string) data_get($response->json(), 'message', '') : 'Gateway merespons HTTP '.$response->status().'.',
                'data' => $response->json() ?: [],
            ];
        } catch (\Throwable $exception) {
            return [
                'ok' => false,
                'message' => $exception->getMessage(),
                'data' => [],
            ];
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function restartGateway(): array
    {
        return $this->postGatewayAction('/restart', 'Perintah restart gateway dikirim.');
    }

    /**
     * @return array<string, mixed>
     */
    public function logoutGatewaySession(): array
    {
        return $this->postGatewayAction('/logout-session', 'Session gateway dihapus.');
    }

    /**
     * @return array<string, mixed>
     *
     * @throws RequestException
     */
    private function sendViaMeta(string $phone, string $message): array
    {
        if (! filled(config('services.whatsapp.phone_number_id')) || ! filled(config('services.whatsapp.access_token'))) {
            throw new RuntimeException('Konfigurasi Meta WhatsApp Cloud API belum lengkap.');
        }

        $endpoint = sprintf(
            '%s/%s/%s/messages',
            rtrim((string) config('services.whatsapp.api_url'), '/'),
            trim((string) config('services.whatsapp.api_version'), '/'),
            config('services.whatsapp.phone_number_id')
        );

        return Http::withToken((string) config('services.whatsapp.access_token'))
            ->acceptJson()
            ->asJson()
            ->post($endpoint, [
                'messaging_product' => 'whatsapp',
                'recipient_type' => 'individual',
                'to' => $this->normalizePhone($phone),
                'type' => 'text',
                'text' => [
                    'preview_url' => false,
                    'body' => $message,
                ],
            ])
            ->throw()
            ->json();
    }

    /**
     * @return array<string, mixed>
     *
     * @throws RequestException
     */
    private function sendViaBaileys(string $phone, string $message): array
    {
        if (! filled(config('services.whatsapp.baileys_base_url')) || ! filled(config('services.whatsapp.baileys_token'))) {
            throw new RuntimeException('Konfigurasi Baileys Gateway belum lengkap.');
        }

        $payload = $this->baileysClient()
            ->post('/send-message', [
                'phone' => $this->normalizePhone($phone),
                'message' => $message,
                'wait_delivery' => (bool) config('services.whatsapp.baileys_wait_delivery', true),
            ])
            ->throw()
            ->json();

        if (! (bool) data_get($payload, 'ok')) {
            throw new RuntimeException((string) data_get($payload, 'message', 'Baileys Gateway gagal mengirim pesan.'));
        }

        return $payload;
    }

    private function baileysClient(): \Illuminate\Http\Client\PendingRequest
    {
        return Http::baseUrl(rtrim((string) config('services.whatsapp.baileys_base_url'), '/'))
            ->withToken((string) config('services.whatsapp.baileys_token'))
            ->acceptJson()
            ->asJson()
            ->timeout((int) config('services.whatsapp.baileys_timeout', 20));
    }

    /**
     * @return array<string, mixed>
     */
    private function postGatewayAction(string $path, string $fallbackMessage): array
    {
        if (! $this->isConfigured() || $this->provider() !== 'baileys') {
            return [
                'ok' => false,
                'message' => 'Baileys Gateway belum aktif atau konfigurasi .env belum lengkap.',
            ];
        }

        try {
            $response = $this->baileysClient()->post($path);
            $payload = $response->json() ?: [];

            return [
                'ok' => $response->successful() && (bool) data_get($payload, 'ok', true),
                'status' => $response->status(),
                'message' => (string) data_get($payload, 'message', $fallbackMessage),
                'data' => $payload,
            ];
        } catch (\Throwable $exception) {
            return [
                'ok' => false,
                'message' => $exception->getMessage(),
            ];
        }
    }

    private function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D+/', '', $phone) ?: '';

        if (str_starts_with($digits, '0')) {
            return '62'.substr($digits, 1);
        }

        return $digits;
    }
}
