export default function StatCard({ title, value, helper, icon: Icon, tone = 'emerald' }) {
    const tones = {
        emerald: 'from-emerald-700 via-teal-600 to-lime-500 border-emerald-200/30 shadow-emerald-700/15',
        amber: 'from-amber-500 via-orange-500 to-yellow-500 border-amber-200/40 shadow-amber-700/15',
        rose: 'from-rose-700 via-red-600 to-orange-500 border-rose-200/30 shadow-rose-700/15',
        sky: 'from-sky-700 via-cyan-600 to-blue-500 border-cyan-200/30 shadow-sky-700/15',
    };
    const selectedTone = tones[tone] || tones.emerald;

    return (
        <div className={`rounded-xl border bg-gradient-to-br p-3.5 text-white shadow-md ${selectedTone}`}>
            <div className="flex items-start justify-between gap-2.5">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">{title}</p>
                    <p className="mt-1.5 text-xl font-extrabold tracking-tight text-white">{value}</p>
                    {helper && <p className="mt-0.5 text-[10px] font-semibold text-white/75">{helper}</p>}
                </div>
                {Icon && (
                    <div className="rounded-lg bg-white/18 p-2 text-white shadow-sm ring-1 ring-white/15">
                        <Icon className="h-3.5 w-3.5" />
                    </div>
                )}
            </div>
        </div>
    );
}
