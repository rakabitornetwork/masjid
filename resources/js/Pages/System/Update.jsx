import { useState } from 'react';
import { router } from '@inertiajs/react';
import { CheckCircle2, ClipboardCheck, RefreshCw, Rocket, Sparkles } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';

const updateCommands = `cd ~/public_html
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache`;

export default function Update({ currentVersion, latestVersion, latestUpdate, updateResult }) {
    const [copied, setCopied] = useState(false);
    const [running, setRunning] = useState(false);

    const copyUpdateCommands = async () => {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(updateCommands);
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = updateCommands;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }

        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
    };

    const runUpdate = () => {
        const confirmed = window.confirm(
            'Jalankan update aplikasi sekarang? Proses ini akan menjalankan git pull, composer install, migrate, dan cache Laravel di server.',
        );

        if (!confirmed) {
            return;
        }

        setRunning(true);
        router.post(
            '/update-aplikasi/run',
            {},
            {
                preserveScroll: true,
                onFinish: () => setRunning(false),
            },
        );
    };

    const isLatest = currentVersion === latestVersion;

    return (
        <AppLayout title="Update Aplikasi">
            <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <article className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-emerald-950/5">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Informasi Update Terbaru</p>
                            <h3 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{latestUpdate.title}</h3>
                            <p className="mt-2 text-sm font-semibold text-slate-500">Tanggal rilis: {latestUpdate.date}</p>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">{latestUpdate.summary}</p>
                        </div>
                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                            <button
                                type="button"
                                onClick={copyUpdateCommands}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-black text-emerald-700 shadow-lg shadow-emerald-600/10 transition hover:bg-emerald-50"
                            >
                                {copied ? <ClipboardCheck className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                {copied ? 'Perintah Disalin' : 'Salin Perintah'}
                            </button>
                            <button
                                type="button"
                                onClick={runUpdate}
                                disabled={running}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCw className={`h-4 w-4 ${running ? 'animate-spin' : ''}`} />
                                {running ? 'Menjalankan Update...' : 'Jalankan Update'}
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 rounded-2xl bg-slate-950 p-4">
                        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                            Perintah yang disalin atau dijalankan tombol update
                        </p>
                        <pre className="overflow-x-auto text-sm leading-7 text-emerald-100">
                            <code>{updateCommands}</code>
                        </pre>
                    </div>

                    {updateResult && (
                        <div className="mt-6 rounded-2xl border border-emerald-100 bg-white p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Hasil Update Terakhir</p>
                                    <h4 className="mt-1 font-black text-slate-950">
                                        {updateResult.status === 'success' ? 'Update berhasil' : 'Update gagal'}
                                    </h4>
                                </div>
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${
                                        updateResult.status === 'success'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-rose-100 text-rose-700'
                                    }`}
                                >
                                    {updateResult.finished_at}
                                </span>
                            </div>
                            <div className="mt-4 space-y-3">
                                {updateResult.logs.map((log, index) => (
                                    <div key={`${log.command}-${index}`} className="rounded-2xl bg-slate-950 p-3">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <code className="text-xs font-bold text-emerald-200">{log.command}</code>
                                            <span
                                                className={`rounded-full px-2 py-1 text-[11px] font-black ${
                                                    log.exitCode === 0 ? 'bg-emerald-400/20 text-emerald-100' : 'bg-rose-400/20 text-rose-100'
                                                }`}
                                            >
                                                exit {log.exitCode}
                                            </span>
                                        </div>
                                        {(log.output || log.error) && (
                                            <pre className="mt-3 max-h-44 overflow-auto whitespace-pre-wrap text-xs leading-6 text-slate-200">
                                                <code>{log.output || log.error}</code>
                                            </pre>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </article>

                <article className="rounded-[2rem] border border-white/70 bg-gradient-to-br from-emerald-600 via-teal-600 to-amber-500 p-6 text-white shadow-xl shadow-emerald-950/10">
                    <div className="flex items-center justify-between gap-3">
                        <div className="rounded-2xl bg-white/15 p-3">
                            <Rocket className="h-6 w-6" />
                        </div>
                        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
                            {isLatest ? 'Up to Date' : 'Perlu Update'}
                        </span>
                    </div>

                    <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-emerald-100">Versi Terbaru</p>
                    <h3 className="mt-2 text-5xl font-black tracking-tight">v{latestVersion}</h3>

                    <div className="mt-8 grid gap-3">
                        <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">Versi Terpasang</p>
                            <p className="mt-1 text-2xl font-black">v{currentVersion}</p>
                        </div>
                        <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">Repository</p>
                            <p className="mt-1 break-all text-sm font-bold">github.com/rakabitornetwork/masjid</p>
                        </div>
                        <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">Catatan</p>
                            <p className="mt-1 text-sm font-semibold leading-6">
                                Tombol update dapat menjalankan proses langsung dari aplikasi atau menyalin perintah untuk dijalankan manual via SSH.
                            </p>
                        </div>
                    </div>
                </article>
            </section>
        </AppLayout>
    );
}
