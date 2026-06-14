const baseInput =
    'mt-1 w-full rounded-xl border border-emerald-100 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100';

export function Field({ label, error, children }) {
    return (
        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {label}
            {children}
            {error && <span className="mt-1 block text-xs font-medium normal-case tracking-normal text-rose-600">{error}</span>}
        </label>
    );
}

export function TextInput({ label, error, ...props }) {
    return (
        <Field label={label} error={error}>
            <input className={baseInput} {...props} />
        </Field>
    );
}

export function TextareaInput({ label, error, rows = 4, ...props }) {
    return (
        <Field label={label} error={error}>
            <textarea className={baseInput} rows={rows} {...props} />
        </Field>
    );
}

export function SelectInput({ label, error, children, ...props }) {
    return (
        <Field label={label} error={error}>
            <select className={baseInput} {...props}>
                {children}
            </select>
        </Field>
    );
}

export function CheckboxInput({ label, checked, onChange }) {
    return (
        <label className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700">
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
            />
            {label}
        </label>
    );
}

export function PrimaryButton({ children, className = '', ...props }) {
    return (
        <button
            className={`inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export function SecondaryButton({ children, className = '', ...props }) {
    return (
        <button
            className={`inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
