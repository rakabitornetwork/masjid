import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Banknote,
    Beef,
    Bell,
    Boxes,
    Building2,
    CalendarCheck,
    CalendarDays,
    ChevronDown,
    Clock,
    DatabaseBackup,
    Download,
    Files,
    Gauge,
    HandCoins,
    HeartHandshake,
    Heart,
    History,
    Info,
    Landmark,
    LogOut,
    Megaphone,
    Menu,
    MessageCircle,
    RefreshCw,
    Newspaper,
    Search,
    HandHeart,
    ShieldCheck,
    Users,
    UserRoundCheck,
    UsersRound,
    WalletCards,
    Gift,
    Wrench,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ApplicationLogo from '../Components/ApplicationLogo';
import FlashMessage from '../Components/FlashMessage';

const navigationGroups = [
    {
        key: 'main',
        label: 'Utama',
        items: [
            { label: 'Dashboard', href: '/dashboard', icon: Gauge, permission: null },
            { label: 'Profil Masjid', href: '/profil-masjid', icon: Building2, permission: 'profile' },
            { label: 'Tentang Aplikasi', href: '/tentang-aplikasi', icon: Info, permission: null },
        ],
    },
    {
        key: 'people',
        label: 'Data Masjid',
        items: [
            { label: 'Pengurus', href: '/pengurus', icon: UsersRound, permission: 'people' },
            { label: 'Jamaah', href: '/jamaah', icon: UserRoundCheck, permission: 'people' },
            { label: 'Keluarga', href: '/keluarga-jamaah', icon: Users, permission: 'people' },
            { label: 'Fasilitas', href: '/fasilitas-masjid', icon: Building2, permission: 'inventory' },
            { label: 'Inventaris', href: '/inventaris', icon: Boxes, permission: 'inventory' },
            { label: 'Perawatan', href: '/perawatan-inventaris', icon: Wrench, permission: 'inventory' },
        ],
    },
    {
        key: 'content',
        label: 'Konten & Layanan',
        items: [
            { label: 'Pengumuman', href: '/pengumuman', icon: Megaphone, permission: 'content' },
            { label: 'Artikel', href: '/artikel', icon: Newspaper, permission: 'content' },
            { label: 'Notifikasi WA', href: '/notifikasi-wa', icon: MessageCircle, permission: 'content' },
            { label: 'Jadwal', href: '/jadwal', icon: CalendarDays, permission: 'content' },
            { label: 'Jadwal Sholat', href: '/jadwal-sholat', icon: Clock, permission: 'content' },
            { label: 'Booking Fasilitas', href: '/booking-fasilitas', icon: CalendarCheck, permission: 'content' },
            { label: 'Arsip Surat', href: '/arsip-surat', icon: Files, permission: 'content' },
        ],
    },
    {
        key: 'programs',
        label: 'Program Umat',
        items: [
            { label: 'Zakat', href: '/zakat', icon: HandCoins, permission: 'programs' },
            { label: 'Muzakki & Mustahik', href: '/muzakki-mustahik', icon: UsersRound, permission: 'programs' },
            { label: 'Qurban', href: '/qurban', icon: Beef, permission: 'programs' },
            { label: 'Wakaf', href: '/wakaf', icon: Gift, permission: 'programs' },
            { label: 'Program Sosial', href: '/program-sosial', icon: HandHeart, permission: 'programs' },
        ],
    },
    {
        key: 'finance',
        label: 'Keuangan',
        items: [
            { label: 'Akun Kas', href: '/keuangan/akun', icon: WalletCards, permission: 'finance' },
            { label: 'Kategori', href: '/keuangan/kategori', icon: Landmark, permission: 'finance' },
            { label: 'Transaksi', href: '/keuangan/transaksi', icon: Banknote, permission: 'finance' },
            { label: 'Donasi/Infaq', href: '/donasi', icon: HeartHandshake, permission: 'donations' },
            { label: 'Sedekah Khusus', href: '/sedekah-khusus', icon: Heart, permission: 'donations' },
            { label: 'Export Laporan', href: '/laporan/export', icon: Download, permission: 'reports' },
        ],
    },
    {
        key: 'system',
        label: 'Sistem',
        items: [
            { label: 'User Manajemen', href: '/users', icon: ShieldCheck, permission: 'system' },
            { label: 'Audit Log', href: '/audit-log', icon: History, permission: 'system' },
            { label: 'Backup Data', href: '/backup-data', icon: DatabaseBackup, permission: 'system' },
            { label: 'Gateway WA', href: '/pengaturan-gateway-wa', icon: MessageCircle, permission: 'system' },
            { label: 'Update Aplikasi', href: '/update-aplikasi', icon: RefreshCw, permission: 'system' },
        ],
    },
];

const menuSearchScore = (item, searchTerm) => {
    const label = item.label.toLowerCase();
    const href = item.href.toLowerCase();

    if (label === searchTerm) {
        return 0;
    }

    if (label.startsWith(searchTerm)) {
        return 1;
    }

    if (label.includes(searchTerm)) {
        return 2 + label.indexOf(searchTerm) / 100;
    }

    if (href.includes(searchTerm)) {
        return 4;
    }

    return 9;
};

export default function AppLayout({ title, children, actions = null }) {
    const { auth, app = {} } = usePage().props;
    const path = window.location.pathname;
    const [time, setTime] = useState(new Date());
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarScrolling, setSidebarScrolling] = useState(false);
    const [menuSearch, setMenuSearch] = useState('');
    const [openGroupKeys, setOpenGroupKeys] = useState(() => {
        try {
            const saved = JSON.parse(window.localStorage.getItem('masjid-sidebar-open-groups') || '[]');

            return Array.isArray(saved) && saved.length > 0 ? saved : ['main'];
        } catch {
            return ['main'];
        }
    });
    const sidebarScrollTimeoutRef = useRef(null);
    const mosqueName = app.name || 'Masjid';
    const mosqueSubtitle = app.tagline || 'Management';
    const currentYear = time.getFullYear();
    const permissions = auth?.permissions || [];
    const permissionKey = permissions.join('|');
    const isActive = (href) => path === href || (href !== '/dashboard' && path.startsWith(href + '/'));
    const canView = (item) => !item.permission || permissions.includes(item.permission);
    const searchTerm = menuSearch.trim().toLowerCase();
    const hasMenuSearch = searchTerm.length > 0;
    const activeGroupKeys = navigationGroups
        .filter((group) => group.items.some((item) => canView(item) && isActive(item.href)))
        .map((group) => group.key);
    const activeGroup = navigationGroups.find((group) => group.items.some((item) => canView(item) && isActive(item.href)));
    const currentMenuLabel = activeGroup?.label || 'Utama';
    const visibleGroups = navigationGroups
        .map((group) => {
            const items = group.items
                .filter(canView)
                .filter((item) => {
                    if (!hasMenuSearch) {
                        return true;
                    }

                    return `${item.label} ${item.href}`.toLowerCase().includes(searchTerm);
                })
                .sort((a, b) => {
                    if (!hasMenuSearch) {
                        return 0;
                    }

                    return menuSearchScore(a, searchTerm) - menuSearchScore(b, searchTerm) || a.label.localeCompare(b.label);
                });

            return {
                ...group,
                items,
            };
        })
        .filter((group) => group.items.length > 0);

    useEffect(() => {
        const timer = window.setInterval(() => setTime(new Date()), 1000);

        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        if (activeGroupKeys.length === 0) {
            return;
        }

        setOpenGroupKeys((keys) => (keys.includes(activeGroupKeys[0]) ? keys : [activeGroupKeys[0]]));
    }, [path, permissionKey]);

    useEffect(() => {
        if (hasMenuSearch) {
            return;
        }

        window.localStorage.setItem('masjid-sidebar-open-groups', JSON.stringify(openGroupKeys));
    }, [hasMenuSearch, openGroupKeys]);

    useEffect(() => {
        return () => {
            if (sidebarScrollTimeoutRef.current) {
                window.clearTimeout(sidebarScrollTimeoutRef.current);
            }
        };
    }, []);

    const logout = (event) => {
        event.preventDefault();
        router.post('/logout');
    };

    const toggleGroup = (groupKey) => {
        setOpenGroupKeys((keys) => (keys.includes(groupKey) ? [] : [groupKey]));
    };

    const handleSidebarScroll = () => {
        setSidebarScrolling(true);

        if (sidebarScrollTimeoutRef.current) {
            window.clearTimeout(sidebarScrollTimeoutRef.current);
        }

        sidebarScrollTimeoutRef.current = window.setTimeout(() => {
            setSidebarScrolling(false);
        }, 1200);
    };

    return (
        <>
            <Head title={`${title} - ${mosqueName}`} />

            <div className="flex min-h-dvh bg-[#052e2b] font-sans text-slate-800 antialiased lg:h-dvh lg:overflow-hidden">
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

                        <div className="border-b border-white/10 p-2">
                            <label className="relative block">
                                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-emerald-100/65" />
                                <input
                                    type="search"
                                    value={menuSearch}
                                    onChange={(event) => setMenuSearch(event.target.value)}
                                    placeholder="Cari menu..."
                                    className="w-full rounded-lg border border-white/10 bg-white/10 py-2 pr-2.5 pl-8 text-xs font-semibold text-white outline-none placeholder:text-emerald-50/55 focus:border-emerald-200/35 focus:bg-white/15"
                                />
                            </label>
                        </div>

                        <nav
                            className={`sidebar-scrollbar flex-1 space-y-1 overflow-y-auto p-2 ${sidebarScrolling ? 'sidebar-scrollbar-visible' : ''}`}
                            onScroll={handleSidebarScroll}
                        >
                            {visibleGroups.map((group) => {
                                const opened = hasMenuSearch || openGroupKeys.includes(group.key);
                                const groupActive = activeGroupKeys.includes(group.key);

                                return (
                                    <div key={group.key} className="rounded-xl border border-white/5 bg-emerald-950/10">
                                        <button
                                            type="button"
                                            onClick={() => toggleGroup(group.key)}
                                            className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] transition ${
                                                groupActive ? 'text-amber-100' : 'text-emerald-50/75 hover:bg-white/5 hover:text-white'
                                            }`}
                                        >
                                            <span className="truncate">{group.label}</span>
                                            <span className="flex items-center gap-1.5">
                                                <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] tracking-normal text-emerald-50/75">{group.items.length}</span>
                                                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${opened ? 'rotate-180' : ''}`} />
                                            </span>
                                        </button>
                                        <div className={`grid transition-all duration-300 ease-out ${opened ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                            <div className="min-h-0 overflow-hidden">
                                                <div className={`space-y-1 px-1.5 pb-1.5 transition-transform duration-300 ease-out ${opened ? 'translate-y-0' : '-translate-y-1'}`}>
                                                    {group.items.map((item) => {
                                                        const Icon = item.icon;
                                                        const active = isActive(item.href);

                                                        return (
                                                            <Link
                                                                key={item.href}
                                                                href={item.href}
                                                                onClick={() => setSidebarOpen(false)}
                                                                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all duration-150 ${
                                                                    active
                                                                        ? 'bg-gradient-to-r from-emerald-400/25 to-amber-300/20 text-white shadow-sm shadow-emerald-950/15 ring-1 ring-emerald-100/20'
                                                                        : 'text-emerald-50/80 hover:bg-white/10 hover:text-white'
                                                                }`}
                                                            >
                                                                <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-amber-200' : 'text-emerald-100/65'}`} />
                                                                <span className="truncate">{item.label}</span>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {visibleGroups.length === 0 && (
                                <p className="rounded-xl border border-dashed border-emerald-100/15 bg-white/5 p-3 text-center text-[11px] font-semibold leading-5 text-emerald-50/70">
                                    Tidak ada menu yang cocok.
                                </p>
                            )}
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

                <div className="flex min-h-dvh min-w-0 flex-1 flex-col bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.16),transparent_28rem),linear-gradient(135deg,#eff6ff_0%,#f8fafc_46%,#dbeafe_100%)] lg:min-h-0 lg:overflow-hidden">
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
                                <span className="hidden truncate sm:inline">{currentMenuLabel}</span>
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

                    <main className="flex-1 p-4 pt-18 pb-12 lg:min-h-0 lg:overflow-y-auto lg:p-5 lg:pb-14">
                        <FlashMessage />
                        {children}
                        <footer className="mt-6 flex flex-wrap items-center justify-center gap-1 text-center text-[10px] font-medium text-slate-400">
                            <span>Copyright {currentYear} - Aplikasi manajemen masjid ini dibuat oleh Amon dengan</span>
                            <Heart className="h-3 w-3 fill-rose-500 text-rose-500" aria-hidden="true" />
                            <span>untuk Umat.</span>
                        </footer>
                    </main>
                </div>
            </div>
        </>
    );
}
