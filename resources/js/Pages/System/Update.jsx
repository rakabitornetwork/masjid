import { useEffect, useState } from 'react';
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

export default function Update({
    currentVersion,
    latestVersion,
    currentCommit,
    latestCommit,
    updateAvailable,
    githubStatus,
    latestUpdate,
    updateResult,
}) {
    const [copied, setCopied] = useState(false);
    const [running, setRunning] = useState(false);
    const [visibleLogCount, setVisibleLogCount] = useState(0);

    useEffect(() => {
        if (!updateResult?.logs?.length) {
            setVisibleLogCount(0);
            return;
        }

        setVisibleLogCount(0);

        const timer = window.setInterval(() => {
            setVisibleLogCount((count) => {
                if (count >= updateResult.logs.length) {
                    window.clearInterval(timer);
                    return count;
                }

                return count + 1;
            });
        }, 420);

        return () => window.clearInterval(timer);
    }, [updateResult]);

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

    const isGithubConnected = githubStatus === 'success';

    return (
        <AppLayout title="Update Aplikasi">
            <section className="mb-4 grid gap-3 md:grid-cols-4">
                <VersionTile label="Versi Terbaru" value={`v${latestVersion}`} tone={isGithubConnected ? 'emerald' : 'rose'} />
                <VersionTile label="Commit Lokal" value={currentCommit} mono tone={updateAvailable ? 'amber' : 'blue'} />
                <VersionTile label="Commit GitHub" value={latestCommit} mono tone={isGithubConnected ? 'sky' : 'rose'} />
                <VersionTile
                    label="Status"
                    value={!isGithubConnected ? 'GitHub Gagal' : updateAvailable ? 'Perlu Update' : 'Up to Date'}
                    tone={!isGithubConnected ? 'rose' : updateAvailable ? 'amber' : 'teal'}
                />
            </section>

            <section className="grid gap-4">
                <article className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="inline-flex rounded-lg bg-teal-100 p-2 text-teal-700">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-700">Informasi Update Terbaru</p>
                            <h3 className="mt-1 text-base font-extrabold tracking-tight text-slate-950">{latestUpdate.title}</h3>
                            <p className="mt-1 text-[10px] font-semibold text-slate-500">Tanggal rilis: {latestUpdate.date}</p>
                            <p className="mt-3 max-w-2xl text-xs font-medium leading-5 text-slate-600">{latestUpdate.summary}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] ${
                                        isGithubConnected ? 'bg-teal-100 text-teal-700' : 'bg-rose-100 text-rose-700'
                                    }`}
                                >
                                    GitHub: {isGithubConnected ? 'Terhubung' : 'Gagal Dibaca'}
                                </span>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] ${
                                        updateAvailable ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'
                                    }`}
                                >
                                    {updateAvailable ? 'Update tersedia' : 'Aplikasi terbaru'}
                                </span>
                            </div>
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

                    <div className="mt-4 min-w-0 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 p-3 shadow-sm">
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-800">
                                Perintah yang disalin atau dijalankan tombol update
                            </p>
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-amber-700">
                                Masjid Update
                            </span>
                        </div>
                        <pre className="max-w-full overflow-x-auto rounded-lg border border-emerald-100 bg-white/85 p-3 text-[11px] font-semibold leading-6 text-emerald-900">
                            <code>{updateCommands}</code>
                        </pre>
                    </div>

                    {updateResult && (
                        <div className="mt-4 min-w-0 overflow-hidden rounded-xl border border-slate-700 bg-[#050b1a] shadow-xl shadow-slate-950/25">
                            <div className="flex h-9 items-center justify-between border-b border-slate-700 bg-gradient-to-r from-[#183b6b] via-[#0f2f57] to-[#0a1f3f] px-3">
                                <div className="flex min-w-0 items-center gap-2">
                                    <div className="rounded bg-cyan-400/15 p-1 text-cyan-200">
                                        <Terminal className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-[10px] font-bold text-cyan-100">masjid-update@vps: ~/public_html</p>
                                        <p className="text-[9px] font-semibold text-slate-300">
                                            {updateResult.status === 'success' ? 'Update berhasil' : 'Update gagal'} • {updateResult.finished_at}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        title="Minimize"
                                        className="flex h-4 w-4 items-center justify-center rounded-sm border border-amber-300/70 bg-amber-400 text-[10px] font-black leading-none text-amber-950 shadow-sm"
                                    >
                                        -
                                    </button>
                                    <button
                                        type="button"
                                        title="Maximize"
                                        className="flex h-4 w-4 items-center justify-center rounded-sm border border-emerald-300/70 bg-emerald-400 text-[9px] font-black leading-none text-emerald-950 shadow-sm"
                                    >
                                        □
                                    </button>
                                    <button
                                        type="button"
                                        title="Close"
                                        className="flex h-4 w-4 items-center justify-center rounded-sm border border-rose-300/70 bg-rose-500 text-[10px] font-black leading-none text-white shadow-sm"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                            <div className="border-b border-cyan-400/10 bg-[#071228] px-3 py-1.5 font-mono text-[10px] font-bold text-cyan-200">
                                MobaXterm Personal Edition style session - SSH terminal log
                            </div>
                            <div className="min-w-0 space-y-1.5 bg-[#070d1f] p-3 font-mono">
                                {updateResult.logs.slice(0, visibleLogCount).map((log, index) => (
                                    <div
                                        key={`${log.command}-${index}`}
                                        className="terminal-line-in min-w-0"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <code className="min-w-0 break-all text-[10px] font-bold text-teal-200">
                                                <span className="text-lime-300">masjid@vps</span>
                                                <span className="text-slate-400">:</span>
                                                <span className="text-cyan-300">~/public_html</span>
                                                <span className="text-slate-400">$</span> <span className="text-amber-200">{log.command}</span>
                                            </code>
                                            <span
                                                className={`rounded px-1.5 py-0.5 text-[9px] font-black ${
                                                    log.exitCode === 0 ? 'bg-teal-400/20 text-teal-100' : 'bg-rose-400/20 text-rose-100'
                                                }`}
                                            >
                                                exit {log.exitCode}
                                            </span>
                                        </div>
                                        {(log.output || log.error) && (
                                            <pre className="mt-1 max-w-full whitespace-pre-wrap break-words border-l border-cyan-500/25 pl-2 text-[10px] leading-5 text-slate-200">
                                                <code>{log.output || log.error}</code>
                                            </pre>
                                        )}
                                    </div>
                                ))}
                                {visibleLogCount < updateResult.logs.length && (
                                    <div className="terminal-line-in flex items-center gap-1.5 text-[10px] font-bold text-amber-300">
                                        <RefreshCw className="h-3 w-3 animate-spin" />
                                        <span>Menampilkan proses update...</span>
                                        <span className="terminal-cursor h-3 w-1.5 rounded-sm bg-amber-300" />
                                    </div>
                                )}
                                {visibleLogCount >= updateResult.logs.length && (
                                    <div className="terminal-line-in flex items-center gap-1.5 text-[10px] font-bold text-teal-300">
                                        <span>{updateResult.status === 'success' ? 'Update process completed' : 'Update process stopped'}</span>
                                        <span className="terminal-cursor h-3 w-1.5 rounded-sm bg-teal-300" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </article>

            </section>
        </AppLayout>
    );
}

function VersionTile({ label, value, mono = false, tone = 'blue' }) {
    const tones = {
        blue: {
            card: 'from-blue-800 via-blue-700 to-sky-600 border-blue-200/30',
            icon: 'bg-white/15 text-blue-50',
            label: 'text-blue-100',
        },
        sky: {
            card: 'from-sky-700 via-cyan-600 to-blue-500 border-cyan-200/30',
            icon: 'bg-white/15 text-cyan-50',
            label: 'text-cyan-50',
        },
        emerald: {
            card: 'from-emerald-700 via-teal-600 to-lime-500 border-emerald-200/30',
            icon: 'bg-white/15 text-emerald-50',
            label: 'text-emerald-50',
        },
        teal: {
            card: 'from-teal-700 via-emerald-600 to-green-500 border-teal-200/30',
            icon: 'bg-white/15 text-teal-50',
            label: 'text-teal-50',
        },
        amber: {
            card: 'from-amber-500 via-orange-500 to-yellow-500 border-amber-200/40',
            icon: 'bg-white/20 text-amber-50',
            label: 'text-amber-50',
        },
        rose: {
            card: 'from-rose-700 via-red-600 to-orange-500 border-rose-200/30',
            icon: 'bg-white/15 text-rose-50',
            label: 'text-rose-50',
        },
    };
    const selectedTone = tones[tone] || tones.blue;

    return (
        <div className={`min-w-0 rounded-xl border bg-gradient-to-br p-3 text-white shadow-sm ${selectedTone.card}`}>
            <div className="flex items-center gap-2">
                <div className={`rounded-lg p-1.5 ${selectedTone.icon}`}>
                    <Rocket className="h-3.5 w-3.5" />
                </div>
                <p className={`truncate text-[9px] font-bold uppercase tracking-[0.16em] ${selectedTone.label}`}>{label}</p>
            </div>
            <p className={`mt-2 truncate text-sm font-extrabold ${mono ? 'font-mono' : ''}`}>{value}</p>
        </div>
    );
}
