export default function StatCard({ title, value, helper, icon: Icon, tone = 'emerald' }) {
    const tones = {
        emerald: 'from-emerald-500 to-teal-500 text-emerald-700 bg-emerald-50',
        amber: 'from-amber-400 to-orange-400 text-amber-700 bg-amber-50',
        rose: 'from-rose-500 to-pink-500 text-rose-700 bg-rose-50',
        sky: 'from-sky-500 to-cyan-500 text-sky-700 bg-sky-50',
    };

    return (
        <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-4 shadow-xl shadow-emerald-950/5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{title}</p>
                    <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{value}</p>
                    {helper && <p className="mt-1 text-xs font-medium text-slate-500">{helper}</p>}
                </div>
                {Icon && (
                    <div className={`rounded-2xl bg-gradient-to-br p-3 text-white shadow-lg ${tones[tone].split(' ').slice(0, 2).join(' ')}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                )}
            </div>
        </div>
    );
}
