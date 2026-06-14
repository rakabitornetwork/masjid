import { CheckCircle2, Code2, GitCommit, Heart, Info, Layers3, Rocket, Server, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';

export default function About({ application, stack, features }) {
    return (
        <AppLayout title="Tentang Aplikasi">
            <section className="overflow-hidden rounded-3xl border border-teal-100/70 bg-white shadow-xl shadow-blue-950/5">
                <div className="relative isolate overflow-hidden bg-gradient-to-br from-emerald-800 via-teal-700 to-blue-800 p-6 text-white lg:p-8">
                    <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.10)_0%,transparent_34%,rgba(255,255,255,0.08)_100%)]" />
                    <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-sky-300/18 blur-2xl" />
                    <div className="absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-emerald-300/18 blur-2xl" />

                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-amber-300/16 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-amber-50 shadow-sm backdrop-blur">
                                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                                {application.theme}
                            </div>
                            <h1 className="mt-4 text-3xl font-black tracking-tight lg:text-4xl">{application.name}</h1>
                            <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-white/86">{application.description}</p>
                            <div className="mt-5 flex flex-wrap gap-2">
                                <Badge icon={Rocket} label={`Versi ${application.version}`} tone="amber" />
                                <Badge icon={GitCommit} label={`Commit ${application.commit}`} tone="sky" />
                                <Badge icon={Heart} label={`Dibuat oleh ${application.developer}`} tone="rose" />
                                <Badge icon={ShieldCheck} label="Untuk Umat" tone="emerald" />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-sky-200/25 bg-sky-950/20 p-4 text-left shadow-2xl shadow-slate-950/15 backdrop-blur">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-100">Status Sistem</p>
                            <p className="mt-2 text-2xl font-black">{application.environment}</p>
                            <p className="mt-1 text-xs font-semibold text-sky-50/75">Runtime aktif dan konfigurasi terbaca dari server.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
                <div className="space-y-4">
                    <InfoCard title="Informasi Aplikasi" icon={Info} tone="sky">
                        <InfoRow label="Nama Aplikasi" value={application.name} />
                        <InfoRow label="Versi" value={application.version} />
                        <InfoRow label="Commit" value={application.commit} mono />
                        <InfoRow label="Environment" value={application.environment} />
                        <InfoRow label="URL" value={application.url} />
                        <InfoRow label="Timezone" value={application.timezone} />
                        <InfoRow label="Locale" value={application.locale} />
                    </InfoCard>

                    <InfoCard title="Stack Teknologi" icon={Code2} tone="violet">
                        <div className="space-y-2">
                            {stack.map((item) => (
                                <div key={item.label} className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-3 shadow-sm shadow-slate-950/5">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">{item.label}</p>
                                    <p className="mt-1 text-xs font-bold leading-5 text-slate-700">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </InfoCard>
                </div>

                <InfoCard title="Fitur Utama" icon={Layers3} tone="emerald">
                    <div className="grid gap-2 md:grid-cols-2">
                        {features.map((feature, index) => (
                            <div key={feature} className="flex gap-2 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-3 shadow-sm shadow-emerald-950/5">
                                {index % 3 === 0 ? (
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                ) : index % 3 === 1 ? (
                                    <Zap className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                                ) : (
                                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                                )}
                                <p className="text-xs font-bold leading-5 text-slate-700">{feature}</p>
                            </div>
                        ))}
                    </div>
                </InfoCard>
            </section>
        </AppLayout>
    );
}

function Badge({ icon: Icon, label, tone = 'emerald' }) {
    const tones = {
        amber: {
            badge: 'bg-amber-400/18 text-amber-50 ring-amber-200/30',
            icon: 'text-amber-300',
        },
        sky: {
            badge: 'bg-sky-400/18 text-sky-50 ring-sky-200/30',
            icon: 'text-sky-300',
        },
        rose: {
            badge: 'bg-rose-400/18 text-rose-50 ring-rose-200/30',
            icon: 'text-rose-300',
        },
        emerald: {
            badge: 'bg-emerald-400/18 text-emerald-50 ring-emerald-200/30',
            icon: 'text-emerald-300',
        },
    };
    const selectedTone = tones[tone] || tones.emerald;

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 backdrop-blur ${selectedTone.badge}`}>
            <Icon className={`h-3.5 w-3.5 ${selectedTone.icon}`} />
            {label}
        </span>
    );
}

function InfoCard({ title, icon: Icon, children, tone = 'emerald' }) {
    const tones = {
        emerald: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
        sky: 'bg-sky-100 text-sky-700 ring-sky-200',
        violet: 'bg-violet-100 text-violet-700 ring-violet-200',
    };

    return (
        <section className="rounded-2xl border border-white/80 bg-white/95 p-4 shadow-xl shadow-blue-950/5 ring-1 ring-slate-100/80">
            <div className="mb-3 flex items-center gap-2.5">
                <div className={`rounded-xl p-2 ring-1 ${tones[tone] || tones.emerald}`}>
                    <Icon className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-extrabold text-slate-950">{title}</h2>
            </div>
            {children}
        </section>
    );
}

function InfoRow({ label, mono = false, value }) {
    return (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 last:border-b-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</span>
            <span className={`truncate text-right text-xs font-bold text-slate-800 ${mono ? 'font-mono' : ''}`}>{value || '-'}</span>
        </div>
    );
}
