import { router, useForm } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Edit3, MessageCircle, RefreshCw, Send, Trash2, X } from 'lucide-react';
import StatCard from '../../Components/StatCard';
import { PrimaryButton, SecondaryButton, SelectInput, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { label } from '../../lib/formatters';

const emptyForm = {
    template_key: '',
    title: '',
    category: 'general',
    recipient_name: '',
    recipient_phone: '',
    message: '',
    notes: '',
};

const messageTemplates = [
    {
        key: 'announcement',
        label: 'Pengumuman Masjid',
        title: 'Pengumuman Masjid',
        category: 'announcement',
        message: "Assalamu'alaikum warahmatullahi wabarakatuh.\n\nKami informasikan kepada jamaah bahwa ...\n\nTerima kasih.",
    },
    {
        key: 'kajian',
        label: 'Info Kajian',
        title: 'Informasi Kajian',
        category: 'schedule',
        message: "Assalamu'alaikum warahmatullahi wabarakatuh.\n\nInsyaAllah kajian akan dilaksanakan pada:\nHari/Tanggal: ...\nWaktu: ...\nTempat: Masjid\nPemateri: ...\n\nJazakumullahu khairan.",
    },
    {
        key: 'donation',
        label: 'Ajakan Donasi',
        title: 'Informasi Donasi',
        category: 'donation',
        message: "Assalamu'alaikum warahmatullahi wabarakatuh.\n\nKami membuka kesempatan donasi untuk ...\n\nSemoga Allah membalas kebaikan Bapak/Ibu.",
    },
    {
        key: 'booking',
        label: 'Konfirmasi Booking Fasilitas',
        title: 'Konfirmasi Booking Fasilitas',
        category: 'booking',
        message: "Assalamu'alaikum warahmatullahi wabarakatuh.\n\nBooking fasilitas masjid atas nama ... telah kami terima.\nTanggal: ...\nWaktu: ...\nKeperluan: ...\n\nTerima kasih.",
    },
];

const statusMeta = {
    sent: {
        label: 'Berhasil',
        tone: 'bg-emerald-100 text-emerald-700',
    },
    failed: {
        label: 'Gagal',
        tone: 'bg-rose-100 text-rose-700',
    },
    pending_review: {
        label: 'Perlu Dicek',
        tone: 'bg-amber-100 text-amber-700',
    },
    draft: {
        label: 'Belum Terkirim',
        tone: 'bg-slate-100 text-slate-600',
    },
    scheduled: {
        label: 'Data Lama',
        tone: 'bg-slate-100 text-slate-600',
    },
    cancelled: {
        label: 'Dibatalkan',
        tone: 'bg-slate-100 text-slate-600',
    },
};

export default function Index({ notifications, api, summary }) {
    const { data, setData, post, processing, errors, reset } = useForm(emptyForm);

    const submit = (event) => {
        event.preventDefault();

        post('/notifikasi-wa', { preserveScroll: true, onSuccess: () => resetForm() });
    };

    const applyTemplate = (templateKey) => {
        const template = messageTemplates.find((item) => item.key === templateKey);

        if (!template) {
            setData('template_key', '');
            return;
        }

        setData({
            ...data,
            template_key: template.key,
            title: template.title,
            category: template.category,
            message: template.message,
        });
    };

    const reuse = (notification) => {
        setData({
            ...emptyForm,
            title: notification.title || '',
            category: notification.category || 'general',
            recipient_name: notification.recipient_name || '',
            recipient_phone: notification.recipient_phone || '',
            message: notification.message || '',
            notes: '',
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        reset();
        setData(emptyForm);
    };

    const destroy = (notification) => {
        if (window.confirm(`Hapus riwayat "${notification.title}"?`)) {
            router.delete(`/notifikasi-wa/${notification.id}`, { preserveScroll: true });
        }
    };

    const sendApi = (notification) => {
        if (window.confirm(`Kirim ulang "${notification.title}" melalui ${api?.provider || 'WhatsApp API'}?`)) {
            router.post(`/notifikasi-wa/${notification.id}/kirim-api`, {}, { preserveScroll: true });
        }
    };

    const whatsappUrl = (notification) => {
        const phone = String(notification.recipient_phone || '').replace(/\D/g, '');
        return `https://wa.me/${phone}?text=${encodeURIComponent(notification.message || '')}`;
    };

    const manualReady = data.recipient_phone && data.message;

    return (
        <AppLayout title="Kirim WhatsApp">
            <div className={`mb-4 rounded-xl border p-3 text-xs font-semibold ${api?.enabled ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-amber-100 bg-amber-50 text-amber-700'}`}>
                {api?.enabled
                    ? `${api.provider} aktif. Pesan akan langsung dikirim dan masuk ke riwayat pengiriman.`
                    : 'Provider WhatsApp API belum aktif. Tombol kirim otomatis dinonaktifkan, tetapi link manual WhatsApp tetap tersedia setelah nomor dan pesan diisi.'}
            </div>

            <section className="grid gap-4 md:grid-cols-4">
                <StatCard title="Total Riwayat" value={summary.total} helper="Semua percobaan kirim" icon={MessageCircle} />
                <StatCard title="Berhasil" value={summary.sent} helper="Terkirim otomatis" icon={CheckCircle2} tone="emerald" />
                <StatCard title="Perlu Dicek" value={summary.pending_review} helper="Belum terkonfirmasi" icon={AlertTriangle} tone="amber" />
                <StatCard title="Gagal" value={summary.failed} helper="Tidak terkirim" icon={X} tone="rose" />
            </section>

            <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={submit} className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2.5">
                        <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                            <MessageCircle className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">
                                Kirim Sekarang
                            </p>
                            <h3 className="text-sm font-extrabold text-slate-950">Pesan WhatsApp</h3>
                            <p className="mt-0.5 text-xs font-medium text-slate-500">Isi pesan, kirim, lalu pantau hasilnya di riwayat.</p>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <SelectInput label="Template Pesan Cepat" value={data.template_key} onChange={(event) => applyTemplate(event.target.value)}>
                                <option value="">Tulis pesan sendiri</option>
                                {messageTemplates.map((template) => (
                                    <option key={template.key} value={template.key}>
                                        {template.label}
                                    </option>
                                ))}
                            </SelectInput>
                        </div>
                        <div className="md:col-span-2">
                            <TextInput label="Judul Riwayat" value={data.title} onChange={(event) => setData('title', event.target.value)} error={errors.title} placeholder="Contoh: Pengumuman Kajian Jumat" />
                        </div>
                        <SelectInput label="Kategori" value={data.category} onChange={(event) => setData('category', event.target.value)} error={errors.category}>
                            <option value="general">Umum</option>
                            <option value="schedule">Kegiatan</option>
                            <option value="booking">Booking</option>
                            <option value="donation">Donasi</option>
                            <option value="zakat">Zakat</option>
                            <option value="qurban">Qurban</option>
                            <option value="finance">Keuangan</option>
                            <option value="announcement">Pengumuman</option>
                        </SelectInput>
                        <TextInput label="Nama Penerima" value={data.recipient_name} onChange={(event) => setData('recipient_name', event.target.value)} error={errors.recipient_name} />
                        <TextInput label="Nomor WA" value={data.recipient_phone} onChange={(event) => setData('recipient_phone', event.target.value)} error={errors.recipient_phone} placeholder="6281234567890" />
                        <div className="md:col-span-2">
                            <TextareaInput label="Isi Pesan" rows={8} value={data.message} onChange={(event) => setData('message', event.target.value)} error={errors.message} />
                        </div>
                        <div className="md:col-span-2">
                            <TextareaInput label="Catatan Internal" rows={3} value={data.notes || ''} onChange={(event) => setData('notes', event.target.value)} error={errors.notes} placeholder="Opsional, hanya untuk admin" />
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <PrimaryButton disabled={processing || !api?.enabled} className="gap-2">
                            <Send className="h-4 w-4" />
                            {api?.enabled ? 'Kirim via API' : 'API Belum Aktif'}
                        </PrimaryButton>
                        {manualReady && (
                            <a className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100" href={whatsappUrl(data)} target="_blank" rel="noreferrer">
                                <Send className="h-4 w-4" />
                                Buka WhatsApp Manual
                            </a>
                        )}
                        <SecondaryButton type="button" onClick={resetForm} className="gap-2">
                            <X className="h-4 w-4" />
                            Kosongkan
                        </SecondaryButton>
                    </div>
                </form>

                <section className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">Riwayat</p>
                            <h3 className="text-sm font-extrabold text-slate-950">Pengiriman WhatsApp</h3>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">{notifications.length} pesan</span>
                    </div>
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
                                    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${statusMeta[notification.status]?.tone || 'bg-slate-100 text-slate-600'}`}>
                                        {statusMeta[notification.status]?.label || label(notification.status)}
                                    </span>
                                </div>
                                <p className="mt-2 line-clamp-3 rounded-lg bg-slate-50 p-2 text-xs font-medium leading-5 text-slate-600">{notification.message}</p>
                                {notification.notes && <p className="mt-2 line-clamp-2 rounded-lg bg-amber-50 p-2 text-[11px] font-semibold leading-5 text-amber-700">{notification.notes}</p>}
                                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                        Dibuat: {notification.created_at_display || '-'} • Terkirim: {notification.sent_at_display || '-'}
                                    </p>
                                    <div className="flex flex-wrap justify-end gap-2">
                                        {api?.enabled && (
                                            <button className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-2 py-2 text-xs font-bold text-white" type="button" onClick={() => sendApi(notification)}>
                                                <RefreshCw className="h-4 w-4" />
                                                Kirim Ulang
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
                                        <button className="rounded-lg bg-sky-50 p-2 text-sky-700" type="button" onClick={() => reuse(notification)} title="Gunakan lagi">
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                        <button className="rounded-lg bg-rose-50 p-2 text-rose-600" type="button" onClick={() => destroy(notification)}>
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                        {notifications.length === 0 && <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-center text-xs font-semibold text-slate-500">Belum ada riwayat pengiriman WhatsApp.</p>}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
