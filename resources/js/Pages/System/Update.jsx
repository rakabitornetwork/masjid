import { useState } from 'react';
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

export default function Update({ currentVersion, latestVersion, latestUpdate }) {
    const [copied, setCopied] = useState(false);

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
                        <button
                            type="button"
                            onClick={copyUpdateCommands}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700"
                        >
                            {copied ? <ClipboardCheck className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                            {copied ? 'Perintah Disalin' : 'Update Aplikasi'}
                        </button>
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-2">
                        {latestUpdate.items.map((item) => (
                            <div key={item} className="flex items-start gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 text-sm font-semibold text-slate-700">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                {item}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 rounded-2xl bg-slate-950 p-4">
                        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                            Perintah yang disalin oleh tombol update
                        </p>
                        <pre className="overflow-x-auto text-sm leading-7 text-emerald-100">
                            <code>{updateCommands}</code>
                        </pre>
                    </div>
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
                                Tombol update menyalin perintah terminal. Jalankan perintah tersebut di VPS melalui SSH.
                            </p>
                        </div>
                    </div>
                </article>
            </section>
        </AppLayout>
    );
}
