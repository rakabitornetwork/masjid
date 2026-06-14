const baseControl =
    'mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-900 shadow-xs outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100';
const inputControl = `${baseControl} h-9`;
const textareaControl = `${baseControl} min-h-24 py-2 resize-y`;

export function Field({ label, error, children }) {
    return (
        <label className="block min-w-0 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            {label}
            {children}
            {error && <span className="mt-1 block text-[10px] font-semibold normal-case tracking-normal text-rose-600">{error}</span>}
        </label>
    );
}

export function TextInput({ label, error, ...props }) {
    return (
        <Field label={label} error={error}>
            <input className={inputControl} {...props} />
        </Field>
    );
}

export function TextareaInput({ label, error, rows = 4, ...props }) {
    return (
        <Field label={label} error={error}>
            <textarea className={textareaControl} rows={rows} {...props} />
        </Field>
    );
}

export function SelectInput({ label, error, children, ...props }) {
    return (
        <Field label={label} error={error}>
            <select className={inputControl} {...props}>
                {children}
            </select>
        </Field>
    );
}

export function CheckboxInput({ label, checked, onChange, className = '' }) {
    return (
        <label className={`flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 ${className}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="h-3.5 w-3.5 rounded border-teal-300 text-teal-600 focus:ring-teal-500"
            />
            {label}
        </label>
    );
}

export function PrimaryButton({ children, className = '', ...props }) {
    return (
        <button
            className={`inline-flex items-center justify-center rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-teal-700/15 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export function SecondaryButton({ children, className = '', ...props }) {
    return (
        <button
            className={`inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
