<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\App;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationInfoController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('System/About', [
            'application' => [
                'name' => 'Aplikasi Manajemen Masjid',
                'version' => env('APP_VERSION', '1.1'),
                'description' => 'Sistem admin terpadu untuk membantu pengurus masjid mengelola operasional, jamaah, keuangan, program ibadah, ZISWAF, inventaris, fasilitas, laporan, backup, dan update aplikasi.',
                'theme' => 'High Density Premium Masjid',
                'developer' => 'Amon',
                'environment' => App::environment(),
                'url' => config('app.url'),
                'timezone' => config('app.timezone'),
                'locale' => config('app.locale'),
            ],
            'stack' => [
                ['label' => 'Backend', 'value' => 'Laravel '.App::version().' / PHP '.PHP_VERSION],
                ['label' => 'Frontend', 'value' => 'Inertia.js, React, Tailwind CSS v4'],
                ['label' => 'Build Tool', 'value' => 'Vite dengan code splitting / lazy loading'],
                ['label' => 'Icon UI', 'value' => 'lucide-react dan logo SVG custom'],
                ['label' => 'Deployment', 'value' => 'Build lokal di public/build agar VPS tidak wajib memiliki npm'],
            ],
            'features' => [
                'Dashboard operasional masjid',
                'Profil masjid dan branding dinamis',
                'Pengurus, jamaah, dan keluarga jamaah',
                'Jadwal ibadah, agenda publik, pengumuman, dan artikel',
                'Keuangan, akun kas, kategori, transaksi, dan laporan publik',
                'Donasi/infaq, sedekah khusus, zakat, qurban, wakaf, dan program sosial',
                'Inventaris, perawatan inventaris, data fasilitas, dan booking fasilitas',
                'Arsip surat, audit log aktivitas, backup/restore, dan export laporan',
                'User manajemen, role, permission, dan custom permission per user',
                'Notifikasi WhatsApp manual dan integrasi WhatsApp Cloud API',
                'Update aplikasi dari GitHub melalui halaman admin',
            ],
        ]);
    }
}
