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

        $payload = Http::baseUrl(rtrim((string) config('services.whatsapp.baileys_base_url'), '/'))
            ->withToken((string) config('services.whatsapp.baileys_token'))
            ->acceptJson()
            ->asJson()
            ->timeout((int) config('services.whatsapp.baileys_timeout', 20))
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

    private function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D+/', '', $phone) ?: '';

        if (str_starts_with($digits, '0')) {
            return '62'.substr($digits, 1);
        }

        return $digits;
    }
}
