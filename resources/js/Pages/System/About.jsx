import { CheckCircle2, Code2, Heart, Info, Rocket, Server, ShieldCheck, Sparkles } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';

export default function About({ application, stack, features }) {
    return (
        <AppLayout title="Tentang Aplikasi">
            <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
                <div className="relative bg-[radial-gradient(circle_at_12%_0%,rgba(250,204,21,0.28),transparent_28%),linear-gradient(135deg,#047857_0%,#0f766e_48%,#0369a1_100%)] p-5 text-white">
                    <div className="absolute right-4 top-4 rounded-full bg-white/15 p-3 text-white/80">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-100">{application.theme}</p>
                    <h1 className="mt-2 max-w-2xl text-2xl font-black tracking-tight">{application.name}</h1>
                    <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-white/85">{application.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Badge icon={Rocket} label={`Versi ${application.version}`} />
                        <Badge icon={Heart} label={`Dibuat oleh ${application.developer}`} />
                        <Badge icon={ShieldCheck} label="Untuk Umat" />
                    </div>
                </div>
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
                <div className="space-y-4">
                    <InfoCard title="Informasi Aplikasi" icon={Info}>
                        <InfoRow label="Nama Aplikasi" value={application.name} />
                        <InfoRow label="Versi" value={application.version} />
                        <InfoRow label="Environment" value={application.environment} />
                        <InfoRow label="URL" value={application.url} />
                        <InfoRow label="Timezone" value={application.timezone} />
                        <InfoRow label="Locale" value={application.locale} />
                    </InfoCard>

                    <InfoCard title="Stack Teknologi" icon={Code2}>
                        <div className="space-y-2">
                            {stack.map((item) => (
                                <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">{item.label}</p>
                                    <p className="mt-1 text-xs font-bold text-slate-700">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </InfoCard>
                </div>

                <InfoCard title="Fitur Utama" icon={Server}>
                    <div className="grid gap-2 md:grid-cols-2">
                        {features.map((feature) => (
                            <div key={feature} className="flex gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                <p className="text-xs font-bold leading-5 text-slate-700">{feature}</p>
                            </div>
                        ))}
                    </div>
                </InfoCard>
            </section>
        </AppLayout>
    );
}

function Badge({ icon: Icon, label }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/15">
            <Icon className="h-3.5 w-3.5" />
            {label}
        </span>
    );
}

function InfoCard({ title, icon: Icon, children }) {
    return (
        <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2.5">
                <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                    <Icon className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-extrabold text-slate-950">{title}</h2>
            </div>
            {children}
        </section>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 last:border-b-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</span>
            <span className="truncate text-right text-xs font-bold text-slate-800">{value || '-'}</span>
        </div>
    );
}
