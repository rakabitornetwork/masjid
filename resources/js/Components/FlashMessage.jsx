import { usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function FlashMessage() {
    const { flash } = usePage().props;

    if (!flash?.success && !flash?.error) {
        return null;
    }

    const isSuccess = Boolean(flash.success);

    return (
        <div
            className={`mb-4 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm ${
                isSuccess
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-rose-200 bg-rose-50 text-rose-900'
            }`}
        >
            {isSuccess ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <AlertCircle className="mt-0.5 h-4 w-4" />}
            <span>{flash.success || flash.error}</span>
        </div>
    );
}
