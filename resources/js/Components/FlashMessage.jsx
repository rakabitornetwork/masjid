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
            className={`mb-3 flex items-start gap-2.5 rounded-lg border px-3 py-2 text-xs font-semibold shadow-sm ${
                isSuccess
                    ? 'border-teal-200 bg-teal-50 text-teal-900'
                    : 'border-rose-200 bg-rose-50 text-rose-900'
            }`}
        >
            {isSuccess ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5" /> : <AlertCircle className="mt-0.5 h-3.5 w-3.5" />}
            <span>{flash.success || flash.error}</span>
        </div>
    );
}
