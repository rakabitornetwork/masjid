import { Head, Link, usePage } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import ApplicationLogo from '../Components/ApplicationLogo';

export default function PublicLayout({ title, children }) {
    const { app = {} } = usePage().props;
    const currentYear = new Date().getFullYear();

    return (
        <>
            <Head title={title} />
            <main className="min-h-dvh bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.18),transparent_28rem),linear-gradient(135deg,#eff6ff_0%,#f8fafc_48%,#dbeafe_100%)] text-slate-800">
                <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                    <Link href="/" className="flex min-w-0 items-center gap-2.5">
                        <ApplicationLogo className="h-9 w-9 shrink-0 rounded-xl" />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-extrabold text-slate-950">{app.name || 'Masjid'}</p>
                            <p className="truncate text-[10px] font-semibold text-teal-700">{app.tagline || 'Manajemen Masjid'}</p>
                        </div>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link href="/laporan-keuangan" className="hidden rounded-lg bg-white/75 px-3 py-1.5 text-xs font-bold text-teal-700 ring-1 ring-teal-100 sm:inline-flex">
                            Laporan Keuangan
                        </Link>
                        <Link href="/login" className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                            Login Admin
                        </Link>
                    </div>
                </header>

                <div className="mx-auto max-w-6xl px-4 pb-8">{children}</div>

                <footer className="flex flex-wrap items-center justify-center gap-1 px-4 pb-6 text-center text-[10px] font-medium text-slate-400">
                    <span>Copyleft {currentYear} - Aplikasi manajemen masjid ini dibuat oleh Amon dengan</span>
                    <Heart className="h-3 w-3 fill-rose-500 text-rose-500" aria-hidden="true" />
                    <span>untuk Ummat.</span>
                </footer>
            </main>
        </>
    );
}
