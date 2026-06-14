import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Banknote,
    Bell,
    Boxes,
    Building2,
    CalendarDays,
    Clock,
    Gauge,
    Heart,
    Landmark,
    LogOut,
    Megaphone,
    Menu,
    RefreshCw,
    UserRoundCheck,
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
    { label: 'Jamaah', href: '/jamaah', icon: UserRoundCheck },
    { label: 'Pengumuman', href: '/pengumuman', icon: Megaphone },
    { label: 'Jadwal', href: '/jadwal', icon: CalendarDays },
    { label: 'Jadwal Sholat', href: '/jadwal-sholat', icon: Clock },
    { label: 'Inventaris', href: '/inventaris', icon: Boxes },
    { label: 'Akun Kas', href: '/keuangan/akun', icon: WalletCards },
    { label: 'Kategori', href: '/keuangan/kategori', icon: Landmark },
    { label: 'Transaksi', href: '/keuangan/transaksi', icon: Banknote },
    { label: 'Update Aplikasi', href: '/update-aplikasi', icon: RefreshCw },
];

export default function AppLayout({ title, children, actions = null }) {
    const { auth, app = {} } = usePage().props;
    const path = window.location.pathname;
    const [time, setTime] = useState(new Date());
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const mosqueName = app.name || 'Masjid';
    const mosqueSubtitle = app.tagline || 'Management';
    const currentYear = time.getFullYear();

    useEffect(() => {
        const timer = window.setInterval(() => setTime(new Date()), 1000);

        return () => window.clearInterval(timer);
    }, []);

    const isActive = (href) => path === href || (href !== '/dashboard' && path.startsWith(href + '/'));

    const logout = (event) => {
        event.preventDefault();
        router.post('/logout');
    };

    return (
        <>
            <Head title={title} />

            <div className="flex h-dvh overflow-hidden bg-[#052e2b] font-sans text-slate-800 antialiased">
                {sidebarOpen && (
                    <button
                        type="button"
                        aria-label="Tutup menu"
                        className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-xs lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <aside
                    className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-56 shrink-0 flex-col justify-between border-r border-emerald-200/10 bg-[radial-gradient(circle_at_16%_0%,rgba(250,204,21,0.22),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(45,212,191,0.22),transparent_30%),linear-gradient(180deg,#064e3b_0%,#065f46_42%,#0f766e_72%,#164e3f_100%)] shadow-2xl shadow-emerald-950/35 transition-transform duration-200 lg:relative lg:translate-x-0 ${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <div className="min-h-0 flex flex-col flex-1">
                        <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
                            <div className="flex min-w-0 items-center gap-2.5">
                                <ApplicationLogo className="h-8 w-8 shrink-0 rounded-xl" />
                                <div className="min-w-0">
                                    <h1 className="truncate text-xs font-bold leading-tight text-white">{mosqueName}</h1>
                                    <p className="truncate text-[10px] font-medium tracking-wide text-emerald-50/75">{mosqueSubtitle}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(false)}
                                className="rounded-lg border border-white/10 p-1 text-emerald-50 hover:bg-white/10 hover:text-white lg:hidden"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
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
                                                ? 'bg-gradient-to-r from-emerald-400/25 to-amber-300/20 text-white shadow-sm shadow-emerald-950/15 ring-1 ring-emerald-100/20'
                                                : 'text-emerald-50/80 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-amber-200' : 'text-emerald-100/65'}`} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="border-t border-emerald-100/10 bg-emerald-950/25 p-2">
                        <Link href="/profil-admin" className="mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-white/10">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/15 text-xs font-bold text-white shadow-inner">
                                {auth?.user?.avatar_path ? (
                                    <img src={`/storage/${auth.user.avatar_path}`} alt={auth?.user?.name || 'Admin'} className="h-full w-full object-cover" />
                                ) : (
                                    (auth?.user?.name || 'A').charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="mb-0.5 truncate text-[11px] font-bold leading-none text-white">{auth?.user?.name || 'Admin Masjid'}</p>
                                <p className="truncate text-[9px] leading-none text-emerald-50/65">{auth?.user?.email || 'admin@masjid.com'}</p>
                            </div>
                        </Link>
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

                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.16),transparent_28rem),linear-gradient(135deg,#eff6ff_0%,#f8fafc_46%,#dbeafe_100%)]">
                    <header className="absolute left-0 right-0 top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-white/10 px-4 shadow-none backdrop-blur-md lg:relative lg:border-blue-100/70 lg:bg-white/86 lg:shadow-sm lg:shadow-blue-900/5 lg:backdrop-blur-md lg:px-6">
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
                            <div className="flex items-center gap-1 rounded-lg border border-white/45 bg-white/35 px-2 py-1 text-[9px] font-bold text-blue-950 shadow-sm backdrop-blur sm:hidden">
                                <Clock className="h-3 w-3 shrink-0 animate-pulse text-blue-600" />
                                <span className="tabular-nums">{time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="text-blue-300">•</span>
                                <span>{time.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div className="hidden items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50/80 px-2.5 py-1 text-[10px] font-semibold text-blue-700 sm:flex">
                                <Clock className="h-3.5 w-3.5 animate-pulse text-blue-600" />
                                <span className="tabular-nums text-blue-950">
                                    {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                                <span className="text-blue-200">|</span>
                                <span>{time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                            {actions}
                        </div>
                    </header>

                    <main className="min-h-0 flex-1 overflow-y-auto p-4 pt-18 pb-12 lg:p-5 lg:pb-14">
                        <FlashMessage />
                        {children}
                        <footer className="mt-6 flex flex-wrap items-center justify-center gap-1 text-center text-[10px] font-medium text-slate-400">
                            <span>Copyleft {currentYear} - Aplikasi manajemen masjid ini dibuat oleh Amon dengan</span>
                            <Heart className="h-3 w-3 fill-rose-500 text-rose-500" aria-hidden="true" />
                            <span>untuk Ummat.</span>
                        </footer>
                    </main>
                </div>
            </div>
        </>
    );
}
