export default function StatCard({ title, value, helper, icon: Icon, tone = 'emerald' }) {
    const tones = {
        emerald: 'from-emerald-500 to-teal-500 text-emerald-700 bg-emerald-50',
        amber: 'from-amber-400 to-orange-400 text-amber-700 bg-amber-50',
        rose: 'from-rose-500 to-pink-500 text-rose-700 bg-rose-50',
        sky: 'from-sky-500 to-cyan-500 text-sky-700 bg-sky-50',
    };

    return (
        <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
            <div className="flex items-start justify-between gap-2.5">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{title}</p>
                    <p className="mt-1.5 text-xl font-extrabold tracking-tight text-slate-950">{value}</p>
                    {helper && <p className="mt-0.5 text-[10px] font-semibold text-slate-500">{helper}</p>}
                </div>
                {Icon && (
                    <div className={`rounded-lg bg-gradient-to-br p-2 text-white shadow-sm ${tones[tone].split(' ').slice(0, 2).join(' ')}`}>
                        <Icon className="h-3.5 w-3.5" />
                    </div>
                )}
            </div>
        </div>
    );
}
