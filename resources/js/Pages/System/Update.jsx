import { useState } from 'react';
import { router } from '@inertiajs/react';
import { CheckCircle2, ClipboardCheck, RefreshCw, Rocket, Sparkles, Terminal } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';

const updateCommands = `cd ~/public_html
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache`;

export default function Update({ currentVersion, latestVersion, latestCommit, latestUpdate, updateResult }) {
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
                <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="inline-flex rounded-lg bg-teal-100 p-2 text-teal-700">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-700">Informasi Update Terbaru</p>
                            <h3 className="mt-1 text-base font-extrabold tracking-tight text-slate-950">{latestUpdate.title}</h3>
                            <p className="mt-1 text-[10px] font-semibold text-slate-500">Tanggal rilis: {latestUpdate.date}</p>
                            <p className="mt-3 max-w-2xl text-xs font-medium leading-5 text-slate-600">{latestUpdate.summary}</p>
                        </div>
                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                            <button
                                type="button"
                                onClick={copyUpdateCommands}
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                            >
                                {copied ? <ClipboardCheck className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                {copied ? 'Perintah Disalin' : 'Salin Perintah'}
                            </button>
                            <button
                                type="button"
                                onClick={runUpdate}
                                disabled={running}
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-teal-700/15 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCw className={`h-4 w-4 ${running ? 'animate-spin' : ''}`} />
                                {running ? 'Menjalankan Update...' : 'Jalankan Update'}
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 p-3 shadow-sm">
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-800">
                                Perintah yang disalin atau dijalankan tombol update
                            </p>
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-amber-700">
                                Masjid Update
                            </span>
                        </div>
                        <pre className="overflow-x-auto rounded-lg border border-emerald-100 bg-white/85 p-3 text-[11px] font-semibold leading-6 text-emerald-900">
                            <code>{updateCommands}</code>
                        </pre>
                    </div>

                    {updateResult && (
                        <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-md shadow-slate-950/20">
                            <div className="flex items-center justify-between gap-2.5 border-b border-slate-800 bg-slate-900 px-3 py-2">
                                <div>
                                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-300">
                                        <Terminal className="h-3.5 w-3.5" />
                                        Hasil Update Terakhir
                                    </p>
                                    <h4 className="mt-0.5 text-xs font-extrabold text-white">
                                        {updateResult.status === 'success' ? 'Update berhasil' : 'Update gagal'}
                                    </h4>
                                </div>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] ${
                                        updateResult.status === 'success'
                                            ? 'bg-teal-400/20 text-teal-100'
                                            : 'bg-rose-400/20 text-rose-100'
                                    }`}
                                >
                                    {updateResult.finished_at}
                                </span>
                            </div>
                            <div className="max-h-[26rem] space-y-2 overflow-y-auto p-3 font-mono">
                                {updateResult.logs.map((log, index) => (
                                    <div
                                        key={`${log.command}-${index}`}
                                        className="terminal-line-in rounded-lg border border-slate-800 bg-slate-900/80 p-2.5"
                                        style={{ animationDelay: `${index * 90}ms` }}
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <code className="text-[10px] font-bold text-teal-200">
                                                <span className="text-amber-300">$</span> {log.command}
                                            </code>
                                            <span
                                                className={`rounded-full px-2 py-1 text-[11px] font-black ${
                                                    log.exitCode === 0 ? 'bg-teal-400/20 text-teal-100' : 'bg-rose-400/20 text-rose-100'
                                                }`}
                                            >
                                                exit {log.exitCode}
                                            </span>
                                        </div>
                                        {(log.output || log.error) && (
                                            <pre className="mt-2 max-h-44 overflow-auto whitespace-pre-wrap text-[10px] leading-5 text-slate-200">
                                                <code>{log.output || log.error}</code>
                                            </pre>
                                        )}
                                    </div>
                                ))}
                                <div className="terminal-line-in flex items-center gap-1.5 text-[10px] font-bold text-teal-300">
                                    <span>{updateResult.status === 'success' ? 'Update process completed' : 'Update process stopped'}</span>
                                    <span className="terminal-cursor h-3 w-1.5 rounded-sm bg-teal-300" />
                                </div>
                            </div>
                        </div>
                    )}
                </article>

                <article className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-800 via-blue-700 to-sky-600 p-4 text-white shadow-sm">
                    <div className="flex items-center justify-between gap-2.5">
                        <div className="rounded-lg bg-white/15 p-2">
                            <Rocket className="h-4 w-4" />
                        </div>
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em]">
                            {isLatest ? 'Up to Date' : 'Perlu Update'}
                        </span>
                    </div>

                    <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100">Versi Terbaru</p>
                    <h3 className="mt-1 text-2xl font-extrabold tracking-tight">v{latestVersion}</h3>

                    <div className="mt-5 grid gap-2.5">
                        <div className="rounded-lg bg-white/15 p-3 backdrop-blur">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100">Versi Terpasang</p>
                            <p className="mt-0.5 text-base font-extrabold">v{currentVersion}</p>
                        </div>
                        <div className="rounded-lg bg-white/15 p-3 backdrop-blur">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100">Repository</p>
                            <p className="mt-0.5 break-all text-[11px] font-bold">github.com/rakabitornetwork/masjid</p>
                        </div>
                        <div className="rounded-lg bg-white/15 p-3 backdrop-blur">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100">Commit Terbaru</p>
                            <p className="mt-0.5 font-mono text-base font-extrabold">{latestCommit}</p>
                        </div>
                        <div className="rounded-lg bg-white/15 p-3 backdrop-blur">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100">Catatan</p>
                            <p className="mt-0.5 text-[11px] font-semibold leading-5">
                                Tombol update dapat menjalankan proses langsung dari aplikasi atau menyalin perintah untuk dijalankan manual via SSH.
                            </p>
                        </div>
                    </div>
                </article>
            </section>
        </AppLayout>
    );
}
