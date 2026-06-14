import { Link } from '@inertiajs/react';
import { Banknote, CalendarDays, Megaphone, TrendingDown, TrendingUp, UsersRound, WalletCards } from 'lucide-react';
import StatCard from '../../Components/StatCard';
import AppLayout from '../../Layouts/AppLayout';
import { date, label, money, time } from '../../lib/formatters';

export default function Dashboard({ profile, stats, accounts, recentTransactions, upcomingSchedules, announcements }) {
    return (
        <AppLayout title="Dashboard">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Saldo Total" value={money(stats.balance)} helper="Akumulasi kas dan bank" icon={WalletCards} />
                <StatCard title="Pemasukan Bulan Ini" value={money(stats.monthly_income)} helper="Transaksi posted" icon={TrendingUp} tone="sky" />
                <StatCard title="Pengeluaran Bulan Ini" value={money(stats.monthly_expense)} helper="Operasional berjalan" icon={TrendingDown} tone="rose" />
                <StatCard title="Pengurus Aktif" value={stats.active_committee} helper="Struktur takmir/DKM" icon={UsersRound} tone="amber" />
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
                <div className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-emerald-950/5">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Profil Masjid</p>
                            <h3 className="text-xl font-black text-slate-950">{profile?.name || 'Nama masjid belum diatur'}</h3>
                        </div>
                        <Link href="/profil-masjid" className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white">
                            Edit Profil
                        </Link>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <Info label="Tagline" value={profile?.tagline || 'Belum diisi'} />
                        <Info label="Kontak" value={profile?.phone || 'Belum diisi'} />
                        <Info label="Kapasitas" value={profile?.capacity ? `${profile.capacity} jamaah` : 'Belum diisi'} />
                    </div>
                    <p className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-slate-600">
                        {profile?.address || 'Lengkapi alamat, rekening, visi, misi, dan fasilitas masjid untuk membuat dashboard lebih informatif.'}
                    </p>
                </div>

                <div className="rounded-[1.75rem] border border-white/70 bg-slate-950 p-5 text-white shadow-xl shadow-emerald-950/10">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">Akun Kas / Bank</p>
                    <div className="mt-4 space-y-3">
                        {accounts.length === 0 && <p className="text-sm text-slate-300">Belum ada akun kas atau bank.</p>}
                        {accounts.map((account) => (
                            <div key={account.id} className="rounded-2xl bg-white/10 p-3">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="font-bold">{account.name}</p>
                                    <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-[11px] font-bold text-emerald-100">
                                        {label(account.type)}
                                    </span>
                                </div>
                                <p className="mt-2 text-xl font-black text-amber-200">{money(account.balance)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-3">
                <Panel title="Transaksi Terbaru" icon={Banknote} href="/keuangan/transaksi">
                    {recentTransactions.length === 0 && <Empty>Belum ada transaksi.</Empty>}
                    {recentTransactions.map((transaction) => (
                        <ListItem
                            key={transaction.id}
                            title={transaction.description}
                            meta={`${date(transaction.transaction_date)} • ${transaction.account?.name || '-'} • ${
                                transaction.category?.name || '-'
                            }`}
                            value={money(transaction.amount)}
                            valueClass={transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}
                        />
                    ))}
                </Panel>

                <Panel title="Jadwal Terdekat" icon={CalendarDays} href="/jadwal">
                    {upcomingSchedules.length === 0 && <Empty>Belum ada jadwal mendatang.</Empty>}
                    {upcomingSchedules.map((schedule) => (
                        <ListItem
                            key={schedule.id}
                            title={schedule.title}
                            meta={`${date(schedule.date)} • ${time(schedule.start_time)} • ${schedule.location || 'Masjid'}`}
                            value={label(schedule.type)}
                        />
                    ))}
                </Panel>

                <Panel title="Pengumuman" icon={Megaphone} href="/pengumuman">
                    {announcements.length === 0 && <Empty>Belum ada pengumuman.</Empty>}
                    {announcements.map((announcement) => (
                        <ListItem
                            key={announcement.id}
                            title={announcement.title}
                            meta={`${label(announcement.category)} • ${date(announcement.published_at)}`}
                            value={announcement.is_pinned ? 'Pinned' : label(announcement.status)}
                        />
                    ))}
                </Panel>
            </section>
        </AppLayout>
    );
}

function Info({ label, value }) {
    return (
        <div className="rounded-2xl border border-emerald-100 bg-white p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
            <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
        </div>
    );
}

function Panel({ title, icon: Icon, href, children }) {
    return (
        <div className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-emerald-950/5">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-emerald-600" />
                    <h3 className="font-black text-slate-950">{title}</h3>
                </div>
                <Link href={href} className="text-xs font-bold text-emerald-700">
                    Kelola
                </Link>
            </div>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function ListItem({ title, meta, value, valueClass = 'text-slate-600' }) {
    return (
        <div className="rounded-2xl border border-emerald-50 bg-white p-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{title}</p>
                    <p className="mt-1 text-xs text-slate-500">{meta}</p>
                </div>
                <p className={`shrink-0 text-xs font-black ${valueClass}`}>{value}</p>
            </div>
        </div>
    );
}

function Empty({ children }) {
    return <p className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-4 text-sm text-slate-500">{children}</p>;
}
