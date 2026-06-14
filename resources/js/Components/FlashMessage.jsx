import { usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';

export default function FlashMessage() {
    const { flash } = usePage().props;

    if (!flash?.success && !flash?.error) {
        return null;
    }

    const message = flash.success || flash.error;
    const isSuccess = Boolean(flash.success);
    const isDeleted = /hapus|dihapus/i.test(message || '');
    const isDanger = !isSuccess || isDeleted;
    const Icon = isDeleted ? Trash2 : isSuccess ? CheckCircle2 : AlertCircle;

    return (
        <div
            className={`mb-3 flex items-start gap-2.5 rounded-lg border px-3 py-2 text-xs font-semibold shadow-sm ${
                isDanger
                    ? 'border-rose-200 bg-rose-50 text-rose-900'
                    : 'border-teal-200 bg-teal-50 text-teal-900'
            }`}
        >
            <Icon className="mt-0.5 h-3.5 w-3.5" />
            <span>{message}</span>
        </div>
    );
}
