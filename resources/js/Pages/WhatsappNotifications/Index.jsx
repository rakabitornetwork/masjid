import { router, useForm } from '@inertiajs/react';
import { CheckCircle2, Clock, Edit3, MessageCircle, Plus, Send, Trash2, X } from 'lucide-react';
import StatCard from '../../Components/StatCard';
import { PrimaryButton, SecondaryButton, SelectInput, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { date, label } from '../../lib/formatters';

const emptyForm = {
    title: '',
    category: 'general',
    recipient_name: '',
    recipient_phone: '',
    message: '',
    status: 'draft',
    scheduled_at: '',
    sent_at: '',
    notes: '',
};

const statusTone = {
    draft: 'bg-slate-100 text-slate-600',
    scheduled: 'bg-amber-100 text-amber-700',
    sent: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-rose-100 text-rose-700',
};

export default function Index({ notifications, api, summary }) {
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);
    const editingId = data.id || null;

    const submit = (event) => {
        event.preventDefault();
        editingId
            ? put(`/notifikasi-wa/${editingId}`, { preserveScroll: true, onSuccess: () => resetForm() })
            : post('/notifikasi-wa', { preserveScroll: true, onSuccess: () => resetForm() });
    };

    const edit = (notification) => {
        setData({
            ...notification,
            scheduled_at: notification.scheduled_at?.slice(0, 16) || '',
            sent_at: notification.sent_at?.slice(0, 16) || '',
        });
    };

    const resetForm = () => {
        reset();
        setData(emptyForm);
    };

    const destroy = (notification) => {
        if (window.confirm(`Hapus notifikasi "${notification.title}"?`)) {
            router.delete(`/notifikasi-wa/${notification.id}`, { preserveScroll: true });
        }
    };

    const markSent = (notification) => {
        router.post(`/notifikasi-wa/${notification.id}/terkirim`, {}, { preserveScroll: true });
    };

    const sendApi = (notification) => {
        if (window.confirm(`Kirim notifikasi "${notification.title}" melalui ${api?.provider || 'WhatsApp API'} sekarang?`)) {
            router.post(`/notifikasi-wa/${notification.id}/kirim-api`, {}, { preserveScroll: true });
        }
    };

    const whatsappUrl = (notification) => {
        const phone = String(notification.recipient_phone || '').replace(/\D/g, '');
        return `https://wa.me/${phone}?text=${encodeURIComponent(notification.message || '')}`;
    };

    return (
        <AppLayout title="Notifikasi WhatsApp">
            <div className={`mb-4 rounded-xl border p-3 text-xs font-semibold ${api?.enabled ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-amber-100 bg-amber-50 text-amber-700'}`}>
                {api?.enabled
                    ? `${api.provider} aktif. Tombol Kirim API akan mengirim pesan otomatis dan menandai status terkirim.`
                    : 'Provider WhatsApp API belum aktif. Tombol manual tetap bisa membuka WhatsApp/WhatsApp Web melalui link wa.me.'}
            </div>

            <section className="grid gap-4 md:grid-cols-4">
                <StatCard title="Total Pesan" value={summary.total} helper="Semua notifikasi" icon={MessageCircle} />
                <StatCard title="Draft" value={summary.draft} helper="Belum dikirim" icon={Edit3} tone="sky" />
                <StatCard title="Terjadwal" value={summary.scheduled} helper="Menunggu waktu" icon={Clock} tone="amber" />
                <StatCard title="Terkirim" value={summary.sent} helper="Sudah ditandai" icon={CheckCircle2} tone="emerald" />
            </section>

            <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={submit} className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2.5">
                        <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                            <MessageCircle className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">
                                {editingId ? 'Ubah Notifikasi' : 'Tambah Notifikasi'}
                            </p>
                            <h3 className="text-sm font-extrabold text-slate-950">Pesan WhatsApp Manual</h3>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <TextInput label="Judul" value={data.title} onChange={(event) => setData('title', event.target.value)} error={errors.title} />
                        </div>
                        <SelectInput label="Kategori" value={data.category} onChange={(event) => setData('category', event.target.value)} error={errors.category}>
                            <option value="general">Umum</option>
                            <option value="schedule">Jadwal</option>
                            <option value="booking">Booking</option>
                            <option value="donation">Donasi</option>
                            <option value="zakat">Zakat</option>
                            <option value="qurban">Qurban</option>
                            <option value="finance">Keuangan</option>
                            <option value="announcement">Pengumuman</option>
                        </SelectInput>
                        <SelectInput label="Status" value={data.status} onChange={(event) => setData('status', event.target.value)} error={errors.status}>
                            <option value="draft">Draft</option>
                            <option value="scheduled">Terjadwal</option>
                            <option value="sent">Terkirim</option>
                            <option value="cancelled">Dibatalkan</option>
                        </SelectInput>
                        <TextInput label="Nama Penerima" value={data.recipient_name} onChange={(event) => setData('recipient_name', event.target.value)} error={errors.recipient_name} />
                        <TextInput label="Nomor WA" value={data.recipient_phone} onChange={(event) => setData('recipient_phone', event.target.value)} error={errors.recipient_phone} placeholder="6281234567890" />
                        <TextInput label="Jadwal Kirim" type="datetime-local" value={data.scheduled_at || ''} onChange={(event) => setData('scheduled_at', event.target.value)} error={errors.scheduled_at} />
                        <TextInput label="Waktu Terkirim" type="datetime-local" value={data.sent_at || ''} onChange={(event) => setData('sent_at', event.target.value)} error={errors.sent_at} />
                        <div className="md:col-span-2">
                            <TextareaInput label="Isi Pesan" rows={6} value={data.message} onChange={(event) => setData('message', event.target.value)} error={errors.message} />
                        </div>
                        <div className="md:col-span-2">
                            <TextareaInput label="Catatan Internal" value={data.notes || ''} onChange={(event) => setData('notes', event.target.value)} error={errors.notes} />
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <PrimaryButton disabled={processing} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {editingId ? 'Simpan Notifikasi' : 'Tambah Notifikasi'}
                        </PrimaryButton>
                        {editingId && (
                            <SecondaryButton type="button" onClick={resetForm} className="gap-2">
                                <X className="h-4 w-4" />
                                Batal
                            </SecondaryButton>
                        )}
                    </div>
                </form>

                <section className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-950">Daftar Notifikasi WA</h3>
                    <div className="mt-3 space-y-2">
                        {notifications.map((notification) => (
                            <article key={notification.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-extrabold text-slate-900">{notification.title}</p>
                                        <p className="mt-0.5 truncate text-[11px] font-bold text-teal-700">
                                            {notification.recipient_name} • {notification.recipient_phone} • {label(notification.category)}
                                        </p>
                                    </div>
                                    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${statusTone[notification.status] || 'bg-slate-100 text-slate-600'}`}>
                                        {label(notification.status)}
                                    </span>
                                </div>
                                <p className="mt-2 line-clamp-3 rounded-lg bg-slate-50 p-2 text-xs font-medium leading-5 text-slate-600">{notification.message}</p>
                                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                        Jadwal: {date(notification.scheduled_at)} • Terkirim: {date(notification.sent_at)}
                                    </p>
                                    <div className="flex flex-wrap justify-end gap-2">
                                        {api?.enabled && (
                                            <button className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-2 py-2 text-xs font-bold text-white" type="button" onClick={() => sendApi(notification)}>
                                                <Send className="h-4 w-4" />
                                                {notification.status === 'sent' ? 'Kirim Ulang API' : 'API'}
                                            </button>
                                        )}
                                        <a
                                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-2 text-xs font-bold text-emerald-700"
                                            href={whatsappUrl(notification)}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <Send className="h-4 w-4" />
                                            Manual
                                        </a>
                                        {notification.status !== 'sent' && (
                                            <button className="rounded-lg bg-sky-50 p-2 text-sky-700" type="button" onClick={() => markSent(notification)}>
                                                <CheckCircle2 className="h-4 w-4" />
                                            </button>
                                        )}
                                        <button className="rounded-lg bg-emerald-50 p-2 text-emerald-700" type="button" onClick={() => edit(notification)}>
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                        <button className="rounded-lg bg-rose-50 p-2 text-rose-600" type="button" onClick={() => destroy(notification)}>
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                        {notifications.length === 0 && <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-center text-xs font-semibold text-slate-500">Belum ada notifikasi WhatsApp.</p>}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
