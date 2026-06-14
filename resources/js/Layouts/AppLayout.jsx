import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Banknote,
    Bell,
    Building2,
    CalendarDays,
    Clock,
    Gauge,
    Landmark,
    LogOut,
    Megaphone,
    Menu,
    RefreshCw,
    UsersRound,
    WalletCards,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import ApplicationLogo from '../Components/ApplicationLogo';
import FlashMessage from '../Components/FlashMessage';

const navigation = [
    { label: 'Dashboard', href: '/dashboard', icon: Gauge },
    { label: 'Profil Masjid', href: '/profil-masjid', icon: Building2 },
    { label: 'Pengurus', href: '/pengurus', icon: UsersRound },
    { label: 'Pengumuman', href: '/pengumuman', icon: Megaphone },
    { label: 'Jadwal', href: '/jadwal', icon: CalendarDays },
    { label: 'Akun Kas', href: '/keuangan/akun', icon: WalletCards },
    { label: 'Kategori', href: '/keuangan/kategori', icon: Landmark },
    { label: 'Transaksi', href: '/keuangan/transaksi', icon: Banknote },
    { label: 'Update Aplikasi', href: '/update-aplikasi', icon: RefreshCw },
];

export default function AppLayout({ title, children, actions = null }) {
    const { auth } = usePage().props;
    const path = window.location.pathname;
    const [time, setTime] = useState(new Date());
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const timer = window.setInterval(() => setTime(new Date()), 1000);

        return () => window.clearInterval(timer);
    }, []);

    const isActive = (href) => path === href || (href !== '/dashboard' && path.startsWith(href));

    const logout = (event) => {
        event.preventDefault();
        router.post('/logout');
    };

    return (
        <>
            <Head title={title} />

            <div className="flex min-h-screen bg-[#061A40] font-sans text-xs text-slate-800 antialiased">
                {sidebarOpen && (
                    <button
                        type="button"
                        aria-label="Tutup menu"
                        className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-xs lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <aside
                    className={`fixed inset-y-0 left-0 z-40 flex w-56 shrink-0 flex-col justify-between border-r border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.28),transparent_30%),linear-gradient(180deg,#061A40_0%,#0B2F6B_55%,#075985_100%)] shadow-2xl shadow-blue-950/30 transition-transform duration-200 lg:relative lg:translate-x-0 ${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <div className="min-h-0">
                        <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
                            <div className="flex items-center gap-2.5">
                                <ApplicationLogo className="h-8 w-8 rounded-xl" />
                                <div>
                                    <h1 className="text-xs font-bold leading-tight text-white">Masjid</h1>
                                    <p className="text-[10px] font-medium tracking-wide text-blue-100/75">Management</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(false)}
                                className="rounded-lg border border-white/10 p-1 text-blue-100 hover:bg-white/10 hover:text-white lg:hidden"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <nav className="max-h-[calc(100vh-9rem)] space-y-1 overflow-y-auto p-2">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                                            active
                                                ? 'bg-white/[0.16] text-white shadow-sm shadow-sky-500/10 ring-1 ring-white/10'
                                                : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-emerald-200' : 'text-blue-200/65'}`} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="border-t border-white/10 bg-blue-950/25 p-2">
                        <div className="mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/15 text-xs font-bold text-white shadow-inner">
                                {(auth?.user?.name || 'A').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="mb-0.5 truncate text-[11px] font-bold leading-none text-white">{auth?.user?.name || 'Admin Masjid'}</p>
                                <p className="truncate text-[9px] leading-none text-blue-100/65">{auth?.user?.email || 'admin@masjid.com'}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={logout}
                            className="flex w-full items-center gap-2.5 rounded-lg bg-rose-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm shadow-rose-950/20 transition-all hover:bg-rose-700"
                        >
                            <LogOut className="h-3.5 w-3.5 shrink-0" />
                            Keluar
                        </button>
                    </div>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.16),transparent_28rem),linear-gradient(135deg,#eff6ff_0%,#f8fafc_46%,#dbeafe_100%)]">
                    <header className="flex h-14 items-center justify-between border-b border-blue-100/70 bg-white/86 px-4 shadow-sm shadow-blue-900/5 backdrop-blur-md lg:px-6">
                        <div className="flex min-w-0 items-center">
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(true)}
                                className="mr-2.5 rounded-lg border border-blue-100 p-1 text-blue-800 hover:bg-blue-50 lg:hidden"
                            >
                                <Menu className="h-4 w-4" />
                            </button>

                            <div className="flex min-w-0 items-center gap-1.5 text-xs font-bold text-blue-950">
                                <Bell className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                                <span className="hidden truncate sm:inline">High Density Masjid</span>
                                <span className="hidden text-blue-200 sm:inline">/</span>
                                <span className="truncate font-semibold text-blue-700">{title}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50/80 px-2.5 py-1 text-[10px] font-semibold text-blue-700 sm:flex">
                                <Clock className="h-3.5 w-3.5 animate-pulse text-blue-600" />
                                <span className="tabular-nums text-blue-950">
                                    {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                            </div>
                            <div className="rounded-lg bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 ring-1 ring-amber-100">
                                {auth?.user?.role || 'pengurus'}
                            </div>
                            {actions}
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto p-4 lg:p-5">
                        <FlashMessage />
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
