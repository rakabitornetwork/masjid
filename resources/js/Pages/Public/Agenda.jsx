import { Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Clock, MapPin, Sparkles } from 'lucide-react';
import PublicLayout from '../../Layouts/PublicLayout';
import { date, label, time } from '../../lib/formatters';

export default function Agenda({ profile, schedules, summary }) {
    return (
        <PublicLayout title={`Agenda - ${profile?.name || 'Masjid'}`}>
            <section className="py-6">
                <Link href="/" className="inline-flex items-center gap-1.5 rounded-xl bg-white/80 px-3 py-2 text-xs font-extrabold text-teal-700 ring-1 ring-teal-100">
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Beranda
                </Link>

                <div className="mt-4 rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-700 to-sky-700 p-6 text-white shadow-xl shadow-emerald-950/15 lg:p-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-100">Agenda Publik</p>
                    <h1 className="mt-3 text-3xl font-black tracking-tight lg:text-4xl">Jadwal Kegiatan Masjid</h1>
                    <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-emerald-50/85">
                        Lihat agenda ibadah, kajian, kegiatan jamaah, dan layanan masjid yang akan datang.
                    </p>
                </div>
            </section>

            <section className="grid gap-3 pb-4 md:grid-cols-3">
                <InfoCard icon={CalendarDays} label="Total Agenda" value={summary.total} />
                <InfoCard icon={Sparkles} label="7 Hari Ke Depan" value={summary.thisWeek} />
                <InfoCard icon={Clock} label="Shalat Jumat" value={summary.friday} />
            </section>

            <section className="pb-8">
                <div className="grid gap-3 lg:grid-cols-2">
                    {schedules.map((schedule) => (
                        <article key={schedule.id} className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-teal-700">
                                        {label(schedule.type)} • {label(schedule.status)}
                                    </p>
                                    <h2 className="mt-1 text-base font-black text-slate-950">{schedule.title}</h2>
                                    <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{schedule.description || 'Agenda kegiatan masjid.'}</p>
                                </div>
                                <div className="shrink-0 rounded-xl bg-teal-50 px-3 py-2 text-right">
                                    <p className="text-xs font-extrabold text-slate-950">{date(schedule.date)}</p>
                                    <p className="text-[11px] font-bold text-teal-700">
                                        {time(schedule.start_time)} - {time(schedule.end_time)}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 grid gap-2 rounded-xl bg-slate-50 p-3 text-[11px] font-semibold text-slate-600 sm:grid-cols-2">
                                <p className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-teal-600" />
                                    {schedule.location || 'Masjid'}
                                </p>
                                <p>Pembicara: {schedule.speaker || schedule.khatib || schedule.imam || '-'}</p>
                            </div>
                        </article>
                    ))}
                    {schedules.length === 0 && (
                        <p className="rounded-2xl border border-dashed border-teal-200 bg-teal-50/60 p-6 text-center text-xs font-semibold text-slate-500 lg:col-span-2">
                            Belum ada agenda publik yang akan datang.
                        </p>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}

function InfoCard({ icon: Icon, label, value }) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white/85 p-4 shadow-sm">
            <Icon className="h-4 w-4 text-teal-600" />
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
            <p className="mt-1 text-xl font-black text-slate-900">{value}</p>
        </div>
    );
}
