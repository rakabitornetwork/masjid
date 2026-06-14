import { Link } from '@inertiajs/react';
import { ArrowRight, Banknote, CalendarDays, Megaphone, MapPin, WalletCards } from 'lucide-react';
import PublicLayout from '../../Layouts/PublicLayout';
import { date, label, money, time } from '../../lib/formatters';

export default function Home({ profile, announcements, upcomingSchedules, publicAccounts, summary }) {
    return (
        <PublicLayout title={profile?.name || 'Masjid'}>
            <section className="grid gap-5 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                <div className="rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-700 to-sky-700 p-6 text-white shadow-xl shadow-emerald-950/15 lg:p-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-100">Portal Jamaah</p>
                    <h1 className="mt-3 text-3xl font-black tracking-tight lg:text-4xl">{profile?.name || 'Masjid'}</h1>
                    <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-emerald-50/85">
                        {profile?.tagline || 'Pusat informasi kegiatan, pengumuman, jadwal, dan transparansi keuangan masjid.'}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                        <Link href="/laporan-keuangan" className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-teal-700">
                            Lihat Laporan Keuangan <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href="/login" className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-4 py-2 text-xs font-extrabold text-white ring-1 ring-white/20">
                            Login Admin
                        </Link>
                    </div>
                </div>

                <div className="grid gap-3">
                    <InfoCard icon={MapPin} label="Alamat" value={profile?.address || 'Alamat masjid belum diisi'} />
                    <InfoCard icon={WalletCards} label="Saldo Bersih Posted" value={money(summary.balance)} />
                    <InfoCard icon={Banknote} label="Pemasukan / Pengeluaran" value={`${money(summary.income)} / ${money(summary.expense)}`} />
                </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
                <Panel title="Pengumuman Jamaah" icon={Megaphone}>
                    {announcements.map((announcement) => (
                        <article key={announcement.id} className="rounded-xl border border-slate-100 bg-white p-3">
                            <p className="text-xs font-extrabold text-slate-950">{announcement.title}</p>
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-teal-700">
                                {label(announcement.category)} • {date(announcement.published_at)}
                            </p>
                            <p className="mt-2 line-clamp-3 text-xs font-medium leading-5 text-slate-600">{announcement.body}</p>
                        </article>
                    ))}
                    {announcements.length === 0 && <Empty>Belum ada pengumuman publik.</Empty>}
                </Panel>

                <Panel title="Jadwal Kegiatan" icon={CalendarDays}>
                    {upcomingSchedules.map((schedule) => (
                        <article key={schedule.id} className="rounded-xl border border-slate-100 bg-white p-3">
                            <p className="text-xs font-extrabold text-slate-950">{schedule.title}</p>
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-teal-700">
                                {date(schedule.date)} • {time(schedule.start_time)} • {schedule.location || 'Masjid'}
                            </p>
                        </article>
                    ))}
                    {upcomingSchedules.length === 0 && <Empty>Belum ada jadwal mendatang.</Empty>}
                </Panel>

                <Panel title="Rekening Donasi" icon={WalletCards}>
                    {publicAccounts.map((account) => (
                        <article key={account.id} className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                            <p className="text-xs font-extrabold text-slate-950">{account.name}</p>
                            <p className="mt-1 text-[11px] font-bold text-teal-700">{label(account.type)}</p>
                            {(account.bank_name || account.account_number) && (
                                <p className="mt-2 text-xs font-semibold text-slate-600">
                                    {account.bank_name} {account.account_number} {account.account_holder && `a.n. ${account.account_holder}`}
                                </p>
                            )}
                        </article>
                    ))}
                    {publicAccounts.length === 0 && <Empty>Rekening donasi belum tersedia.</Empty>}
                </Panel>
            </section>
        </PublicLayout>
    );
}

function InfoCard({ icon: Icon, label, value }) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white/85 p-4 shadow-sm">
            <Icon className="h-4 w-4 text-teal-600" />
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
            <p className="mt-1 text-sm font-extrabold text-slate-900">{value}</p>
        </div>
    );
}

function Panel({ title, icon: Icon, children }) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white/85 p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
                <Icon className="h-4 w-4 text-teal-600" />
                <h2 className="text-xs font-black uppercase tracking-[0.14em] text-slate-950">{title}</h2>
            </div>
            <div className="space-y-2">{children}</div>
        </div>
    );
}

function Empty({ children }) {
    return <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-center text-xs font-semibold text-slate-500">{children}</p>;
}
