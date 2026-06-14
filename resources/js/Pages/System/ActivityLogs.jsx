import { AlertTriangle, History, LogIn, ShieldCheck } from 'lucide-react';
import StatCard from '../../Components/StatCard';
import AppLayout from '../../Layouts/AppLayout';
import { date, label } from '../../lib/formatters';

const actionTone = {
    login: 'bg-emerald-100 text-emerald-700',
    logout: 'bg-slate-100 text-slate-600',
    create: 'bg-teal-100 text-teal-700',
    update: 'bg-sky-100 text-sky-700',
    delete: 'bg-rose-100 text-rose-700',
    restore: 'bg-amber-100 text-amber-700',
    execute: 'bg-violet-100 text-violet-700',
};

export default function ActivityLogs({ logs, summary }) {
    return (
        <AppLayout title="Audit Log">
            <section className="grid gap-4 md:grid-cols-4">
                <StatCard title="Total Log" value={summary.total} helper="Semua aktivitas" icon={History} />
                <StatCard title="Hari Ini" value={summary.today} helper="Aktivitas terbaru" icon={ShieldCheck} tone="sky" />
                <StatCard title="Login" value={summary.login} helper="Akses dashboard" icon={LogIn} tone="emerald" />
                <StatCard title="Aksi Sensitif" value={summary.danger} helper="Delete / restore" icon={AlertTriangle} tone="rose" />
            </section>

            <section className="mt-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">Riwayat Aktivitas</p>
                        <h3 className="text-sm font-extrabold text-slate-950">100 aktivitas terbaru</h3>
                    </div>
                    <p className="text-xs font-semibold text-slate-500">Password dan file upload tidak disimpan di metadata log.</p>
                </div>

                <div className="mt-3 space-y-2">
                    {logs.map((log) => (
                        <article key={log.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${actionTone[log.action] || 'bg-slate-100 text-slate-600'}`}>
                                            {label(log.action)}
                                        </span>
                                        <p className="truncate text-sm font-extrabold text-slate-900">{log.description}</p>
                                    </div>
                                    <p className="mt-1 text-[11px] font-semibold text-slate-500">
                                        {log.user_name || 'System'} {log.user_email ? `(${log.user_email})` : ''} • {date(log.created_at)}
                                    </p>
                                </div>
                                <div className="flex shrink-0 flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                    <span>{log.method || '-'}</span>
                                    <span>{log.status_code || '-'}</span>
                                </div>
                            </div>
                            <div className="mt-2 grid gap-1 rounded-lg bg-slate-50 p-2 text-[11px] font-semibold text-slate-600 sm:grid-cols-2">
                                <p className="truncate">Route: {log.route_name || '-'}</p>
                                <p className="truncate">Path: {log.path || '-'}</p>
                                <p className="truncate">IP: {log.ip_address || '-'}</p>
                                <p className="truncate">Browser: {log.user_agent || '-'}</p>
                            </div>
                        </article>
                    ))}
                    {logs.length === 0 && (
                        <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-center text-xs font-semibold text-slate-500">
                            Belum ada aktivitas yang tercatat.
                        </p>
                    )}
                </div>
            </section>
        </AppLayout>
    );
}
