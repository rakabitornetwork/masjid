import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export default function ApplicationLogo({ className = 'h-9 w-9', src = null, alt = 'Logo aplikasi masjid' }) {
    const { app = {} } = usePage().props;
    const logoPath = src || app.logo_path;
    const logoUrl = logoPath ? (logoPath.startsWith('/storage/') ? logoPath : `/storage/${logoPath}`) : null;

    useEffect(() => {
        if (!logoUrl) {
            return;
        }

        let favicon = document.querySelector("link[rel='icon']");

        if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            document.head.appendChild(favicon);
        }

        favicon.href = logoUrl;
    }, [logoUrl]);

    if (logoUrl) {
        return <img src={logoUrl} alt={alt} className={`${className} object-contain`} />;
    }

    return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <rect width="64" height="64" rx="18" fill="url(#logoGradient)" />
            <path
                d="M15 47h34M18 47V29.8c0-4.6 2.7-8.8 6.9-10.7L32 16l7.1 3.1C43.3 21 46 25.2 46 29.8V47"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M25 47V35h14v12" stroke="white" strokeWidth="4" strokeLinejoin="round" />
            <path d="M32 16V9" stroke="white" strokeWidth="4" strokeLinecap="round" />
            <defs>
                <linearGradient id="logoGradient" x1="7" x2="59" y1="8" y2="57" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#14b8a6" />
                    <stop offset="0.55" stopColor="#059669" />
                    <stop offset="1" stopColor="#ca8a04" />
                </linearGradient>
            </defs>
        </svg>
    );
}
