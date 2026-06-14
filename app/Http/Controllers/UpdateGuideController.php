<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class UpdateGuideController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('System/Update', [
            'currentVersion' => '1.0.0',
            'latestVersion' => '1.0.0',
            'latestUpdate' => [
                'title' => 'Fase 1 Manajemen Masjid',
                'date' => '14 Juni 2026',
                'summary' => 'Rilis awal aplikasi dengan dashboard, profil masjid, pengurus, pengumuman, jadwal, dan keuangan dasar.',
                'items' => [
                    'Laravel 13, Inertia.js, React, Tailwind CSS, dan lucide-react.',
                    'Login admin awal admin@masjid.com dengan password 12345678.',
                    'Build frontend public/build sudah siap dipush untuk VPS tanpa npm.',
                    'Menu Update Aplikasi berisi tombol update dan informasi versi.',
                ],
            ],
        ]);
    }
}
