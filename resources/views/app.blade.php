<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Manajemen Masjid') }}</title>

        @fonts
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        <div
            id="app-loading-fallback"
            style="position: fixed; inset: 0; z-index: 9999; display: grid; place-items: center; background: #061a40; color: #e0f2fe; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;"
        >
            <div style="width: min(420px, calc(100vw - 48px)); border: 1px solid rgba(125, 211, 252, 0.22); border-radius: 18px; background: rgba(7, 18, 40, 0.72); padding: 24px; text-align: center; box-shadow: 0 24px 80px rgba(2, 6, 23, 0.35);">
                <div style="margin: 0 auto 16px; width: 38px; height: 38px; border: 3px solid rgba(125, 211, 252, 0.28); border-top-color: #2dd4bf; border-radius: 999px; animation: app-loading-spin 0.9s linear infinite;"></div>
                <p style="margin: 0; font-size: 12px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: #5eead4;">Memuat Aplikasi</p>
                <p style="margin: 8px 0 0; font-size: 13px; font-weight: 600; line-height: 1.6; color: #cbd5e1;">Mohon tunggu sebentar, tampilan sedang disiapkan setelah update.</p>
            </div>
        </div>
        <style>
            @keyframes app-loading-spin {
                to {
                    transform: rotate(360deg);
                }
            }
        </style>
        @inertia
    </body>
</html>
