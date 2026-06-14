import { Head, Link, usePage } from '@inertiajs/react';
import {
    Banknote,
    Bell,
    Building2,
    CalendarDays,
    Gauge,
    Landmark,
    LogOut,
    Megaphone,
    RefreshCw,
    UsersRound,
    WalletCards,
} from 'lucide-react';
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

    return (
        <>
            <Head title={title} />

            <div className="min-h-screen p-3 text-slate-900 lg:p-5">
                <div className="mx-auto flex max-w-[1500px] gap-4">
                    <aside className="sticky top-5 hidden h-[calc(100vh-2.5rem)] w-72 shrink-0 overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-2xl shadow-emerald-950/10 backdrop-blur xl:block">
                        <div className="flex h-full flex-col">
                            <div className="border-b border-emerald-100 p-5">
                                <div className="flex items-center gap-3">
                                    <ApplicationLogo />
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">Masjid</p>
                                        <h1 className="text-lg font-black leading-tight text-slate-950">Management</h1>
                                    </div>
                                </div>
                                <div className="mt-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 p-4 text-white shadow-lg shadow-emerald-700/20">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">Akun Aktif</p>
                                    <p className="mt-1 truncate text-sm font-bold">{auth?.user?.name}</p>
                                    <p className="text-xs text-emerald-50">{auth?.user?.email}</p>
                                </div>
                            </div>

                            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                                {navigation.map((item) => {
                                    const Icon = item.icon;
                                    const active = path === item.href || (item.href !== '/dashboard' && path.startsWith(item.href));

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                                                active
                                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                                    : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="border-t border-emerald-100 p-3">
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Keluar
                                </Link>
                            </div>
                        </div>
                    </aside>

                    <main className="min-w-0 flex-1">
                        <header className="mb-4 rounded-[1.75rem] border border-white/70 bg-white/80 p-4 shadow-xl shadow-emerald-950/5 backdrop-blur">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
                                        <Bell className="h-3.5 w-3.5" />
                                        High Density Premium Masjid
                                    </p>
                                    <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{title}</h2>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="rounded-2xl bg-amber-100 px-3 py-2 text-xs font-bold text-amber-800">
                                        Role: {auth?.user?.role || 'pengurus'}
                                    </div>
                                    {actions}
                                </div>
                            </div>

                            <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 xl:hidden">
                                {navigation.map((item) => {
                                    const Icon = item.icon;
                                    const active = path === item.href || (item.href !== '/dashboard' && path.startsWith(item.href));

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${
                                                active ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'
                                            }`}
                                        >
                                            <Icon className="h-3.5 w-3.5" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </header>

                        <FlashMessage />

                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
