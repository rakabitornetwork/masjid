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

    public function isConfigured(): bool
    {
        return (bool) config('services.whatsapp.enabled')
            && filled(config('services.whatsapp.phone_number_id'))
            && filled(config('services.whatsapp.access_token'));
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
