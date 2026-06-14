import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Edit3, Megaphone, MessageCircle, RefreshCw, Send, Trash2, UsersRound, X } from 'lucide-react';
import StatCard from '../../Components/StatCard';
import { CheckboxInput, PrimaryButton, SecondaryButton, SelectInput, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { label } from '../../lib/formatters';

const emptyDirectForm = {
    template_key: '',
    title: '',
    category: 'general',
    recipient_name: '',
    recipient_phone: '',
    message: '',
    notes: '',
};

const emptyBroadcastForm = {
    template_key: '',
    title: '',
    category: 'general',
    message: '',
    recipient_mode: 'selected',
    congregant_ids: [],
    neighborhood: '',
    gender: '',
    active_only: true,
    interval_minutes: 7,
    starts_at: '',
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
    sent: { label: 'Berhasil', tone: 'bg-emerald-100 text-emerald-700' },
    failed: { label: 'Gagal', tone: 'bg-rose-100 text-rose-700' },
    pending_review: { label: 'Perlu Dicek', tone: 'bg-amber-100 text-amber-700' },
    queued: { label: 'Menunggu', tone: 'bg-sky-100 text-sky-700' },
    sending: { label: 'Mengirim', tone: 'bg-teal-100 text-teal-700' },
    draft: { label: 'Belum Terkirim', tone: 'bg-slate-100 text-slate-600' },
    scheduled: { label: 'Data Lama', tone: 'bg-slate-100 text-slate-600' },
    cancelled: { label: 'Dibatalkan', tone: 'bg-slate-100 text-slate-600' },
};

const campaignStatusMeta = {
    queued: { label: 'Dalam Antrean', tone: 'bg-sky-100 text-sky-700' },
    running: { label: 'Berjalan', tone: 'bg-teal-100 text-teal-700' },
    completed: { label: 'Selesai', tone: 'bg-emerald-100 text-emerald-700' },
    completed_with_errors: { label: 'Selesai Dengan Catatan', tone: 'bg-amber-100 text-amber-700' },
};

const normalizePhone = (phone) => {
    const digits = String(phone || '').replace(/\D/g, '');
    return digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
};

export default function Index({ notifications, campaigns = [], congregants = [], broadcastFilters = {}, api, summary }) {
    const [mode, setMode] = useState('direct');
    const directForm = useForm(emptyDirectForm);
    const broadcastForm = useForm(emptyBroadcastForm);

    const applyTemplate = (templateKey, form) => {
        const template = messageTemplates.find((item) => item.key === templateKey);

        if (!template) {
            form.setData('template_key', '');
            return;
        }

        form.setData({
            ...form.data,
            template_key: template.key,
            title: template.title,
            category: template.category,
            message: template.message,
        });
    };

    const submitDirect = (event) => {
        event.preventDefault();
        directForm.post('/notifikasi-wa', { preserveScroll: true, onSuccess: () => directForm.setData(emptyDirectForm) });
    };

    const submitBroadcast = (event) => {
        event.preventDefault();

        if (targetCongregants.length === 0) {
            window.alert('Pilih minimal satu jamaah atau gunakan filter yang menghasilkan penerima.');
            return;
        }

        const confirmed = window.confirm(`Buat broadcast untuk ${targetCongregants.length} jamaah dengan jeda ${broadcastForm.data.interval_minutes} menit per nomor?`);

        if (!confirmed) {
            return;
        }

        broadcastForm.post('/notifikasi-wa/broadcast', {
            preserveScroll: true,
            onSuccess: () => broadcastForm.setData(emptyBroadcastForm),
        });
    };

    const reuse = (notification) => {
        setMode('direct');
        directForm.setData({
            ...emptyDirectForm,
            title: notification.title || '',
            category: notification.category || 'general',
            recipient_name: notification.recipient_name || '',
            recipient_phone: notification.recipient_phone || '',
            message: notification.message || '',
            notes: '',
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const selectedIds = (broadcastForm.data.congregant_ids || []).map(String);
    const selectedCongregants = congregants.filter((congregant) => selectedIds.includes(String(congregant.id)));
    const filteredCongregants = ['filter', 'both'].includes(broadcastForm.data.recipient_mode)
        ? congregants.filter((congregant) => {
              if (broadcastForm.data.active_only && !congregant.is_active) {
                  return false;
              }

              if (broadcastForm.data.neighborhood && congregant.neighborhood !== broadcastForm.data.neighborhood) {
                  return false;
              }

              if (broadcastForm.data.gender && congregant.gender !== broadcastForm.data.gender) {
                  return false;
              }

              return true;
          })
        : [];
    const targetCongregants = [...selectedCongregants, ...filteredCongregants].filter(
        (congregant, index, list) => list.findIndex((item) => normalizePhone(item.phone) === normalizePhone(congregant.phone)) === index,
    );
    const manualReady = directForm.data.recipient_phone && directForm.data.message;

    const toggleCongregant = (congregantId, checked) => {
        const id = String(congregantId);
        const nextIds = checked ? [...new Set([...selectedIds, id])] : selectedIds.filter((selectedId) => selectedId !== id);
        broadcastForm.setData('congregant_ids', nextIds);
    };

    const selectAllCongregants = () => {
        broadcastForm.setData('congregant_ids', congregants.map((congregant) => String(congregant.id)));
    };

    return (
        <AppLayout title="Kirim WhatsApp">
            <div className={`mb-4 rounded-xl border p-3 text-xs font-semibold ${api?.enabled ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-amber-100 bg-amber-50 text-amber-700'}`}>
                {api?.enabled
                    ? `${api.provider} aktif. Kirim satuan bisa langsung, broadcast akan masuk antrean bertahap sesuai interval.`
                    : 'Provider WhatsApp API belum aktif. Tombol kirim otomatis dinonaktifkan, tetapi link manual WhatsApp tetap tersedia setelah nomor dan pesan diisi.'}
            </div>

            <section className="grid gap-4 md:grid-cols-4">
                <StatCard title="Total Riwayat" value={summary.total} helper="Semua percobaan kirim" icon={MessageCircle} />
                <StatCard title="Broadcast" value={summary.campaigns} helper="Kampanye bertahap" icon={Megaphone} tone="sky" />
                <StatCard title="Berhasil" value={summary.sent} helper="Terkirim otomatis" icon={CheckCircle2} tone="emerald" />
                <StatCard title="Gagal" value={summary.failed} helper="Tidak terkirim" icon={X} tone="rose" />
            </section>

            <div className="mt-4 flex flex-wrap gap-2">
                <button
                    className={`rounded-lg px-3 py-2 text-xs font-extrabold transition ${mode === 'direct' ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}
                    type="button"
                    onClick={() => setMode('direct')}
                >
                    Kirim Sekarang
                </button>
                <button
                    className={`rounded-lg px-3 py-2 text-xs font-extrabold transition ${mode === 'broadcast' ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}
                    type="button"
                    onClick={() => setMode('broadcast')}
                >
                    Broadcast Jamaah
                </button>
            </div>

            <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                {mode === 'direct' ? (
                    <DirectMessageForm
                        api={api}
                        form={directForm}
                        manualReady={manualReady}
                        onApplyTemplate={(key) => applyTemplate(key, directForm)}
                        onSubmit={submitDirect}
                        whatsappUrl={whatsappUrl}
                    />
                ) : (
                    <BroadcastForm
                        api={api}
                        broadcastFilters={broadcastFilters}
                        congregants={congregants}
                        form={broadcastForm}
                        selectedIds={selectedIds}
                        targetCount={targetCongregants.length}
                        onApplyTemplate={(key) => applyTemplate(key, broadcastForm)}
                        onSelectAll={selectAllCongregants}
                        onSubmit={submitBroadcast}
                        onToggleCongregant={toggleCongregant}
                    />
                )}

                {mode === 'direct' ? (
                    <NotificationHistory api={api} destroy={destroy} notifications={notifications} reuse={reuse} sendApi={sendApi} whatsappUrl={whatsappUrl} />
                ) : (
                    <CampaignHistory campaigns={campaigns} />
                )}
            </div>
        </AppLayout>
    );
}

function DirectMessageForm({ api, form, manualReady, onApplyTemplate, onSubmit, whatsappUrl }) {
    return (
        <form onSubmit={onSubmit} className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <SectionTitle eyebrow="Kirim Sekarang" title="Pesan WhatsApp" helper="Isi pesan, kirim, lalu pantau hasilnya di riwayat." icon={MessageCircle} />

            <div className="grid gap-3 md:grid-cols-2">
                <TemplateSelect value={form.data.template_key} onChange={onApplyTemplate} />
                <div className="md:col-span-2">
                    <TextInput label="Judul Riwayat" value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} error={form.errors.title} placeholder="Contoh: Pengumuman Kajian Jumat" />
                </div>
                <CategorySelect value={form.data.category} onChange={(event) => form.setData('category', event.target.value)} error={form.errors.category} />
                <TextInput label="Nama Penerima" value={form.data.recipient_name} onChange={(event) => form.setData('recipient_name', event.target.value)} error={form.errors.recipient_name} />
                <TextInput label="Nomor WA" value={form.data.recipient_phone} onChange={(event) => form.setData('recipient_phone', event.target.value)} error={form.errors.recipient_phone} placeholder="6281234567890" />
                <div className="md:col-span-2">
                    <TextareaInput label="Isi Pesan" rows={8} value={form.data.message} onChange={(event) => form.setData('message', event.target.value)} error={form.errors.message} />
                </div>
                <div className="md:col-span-2">
                    <TextareaInput label="Catatan Internal" rows={3} value={form.data.notes || ''} onChange={(event) => form.setData('notes', event.target.value)} error={form.errors.notes} placeholder="Opsional, hanya untuk admin" />
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <PrimaryButton disabled={form.processing || !api?.enabled} className="gap-2">
                    <Send className="h-4 w-4" />
                    {api?.enabled ? 'Kirim via API' : 'API Belum Aktif'}
                </PrimaryButton>
                {manualReady && (
                    <a className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100" href={whatsappUrl(form.data)} target="_blank" rel="noreferrer">
                        <Send className="h-4 w-4" />
                        Buka WhatsApp Manual
                    </a>
                )}
                <SecondaryButton type="button" onClick={() => form.setData(emptyDirectForm)} className="gap-2">
                    <X className="h-4 w-4" />
                    Kosongkan
                </SecondaryButton>
            </div>
        </form>
    );
}

function BroadcastForm({ api, broadcastFilters, congregants, form, selectedIds, targetCount, onApplyTemplate, onSelectAll, onSubmit, onToggleCongregant }) {
    const showSelected = ['selected', 'both'].includes(form.data.recipient_mode);
    const showFilter = ['filter', 'both'].includes(form.data.recipient_mode);

    return (
        <form onSubmit={onSubmit} className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <SectionTitle eyebrow="Broadcast Jamaah" title="Antrean Pengiriman Bertahap" helper="Pilih jamaah, tentukan jeda, lalu biarkan queue worker mengirim satu per satu." icon={UsersRound} />

            <div className="grid gap-3 md:grid-cols-2">
                <TemplateSelect value={form.data.template_key} onChange={onApplyTemplate} />
                <div className="md:col-span-2">
                    <TextInput label="Judul Broadcast" value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} error={form.errors.title} placeholder="Contoh: Pengumuman Kajian Ahad" />
                </div>
                <CategorySelect value={form.data.category} onChange={(event) => form.setData('category', event.target.value)} error={form.errors.category} />
                <SelectInput label="Target Penerima" value={form.data.recipient_mode} onChange={(event) => form.setData('recipient_mode', event.target.value)} error={form.errors.recipient_mode}>
                    <option value="selected">Pilih jamaah manual</option>
                    <option value="filter">Berdasarkan filter</option>
                    <option value="both">Manual + filter</option>
                </SelectInput>

                {showFilter && (
                    <>
                        <SelectInput label="Filter RT/RW" value={form.data.neighborhood || ''} onChange={(event) => form.setData('neighborhood', event.target.value)} error={form.errors.neighborhood}>
                            <option value="">Semua RT/RW</option>
                            {(broadcastFilters.neighborhoods || []).map((neighborhood) => (
                                <option key={neighborhood} value={neighborhood}>
                                    {neighborhood}
                                </option>
                            ))}
                        </SelectInput>
                        <SelectInput label="Filter Gender" value={form.data.gender || ''} onChange={(event) => form.setData('gender', event.target.value)} error={form.errors.gender}>
                            <option value="">Semua gender</option>
                            <option value="male">Laki-laki</option>
                            <option value="female">Perempuan</option>
                        </SelectInput>
                        <CheckboxInput label="Hanya jamaah aktif" checked={Boolean(form.data.active_only)} onChange={(value) => form.setData('active_only', value)} />
                    </>
                )}

                <TextInput label="Jeda Kirim per Nomor (menit)" type="number" min="5" max="1440" value={form.data.interval_minutes} onChange={(event) => form.setData('interval_minutes', event.target.value)} error={form.errors.interval_minutes} />
                <TextInput label="Mulai Kirim" type="datetime-local" value={form.data.starts_at || ''} onChange={(event) => form.setData('starts_at', event.target.value)} error={form.errors.starts_at} />

                <div className="md:col-span-2">
                    <TextareaInput label="Isi Pesan Broadcast" rows={8} value={form.data.message} onChange={(event) => form.setData('message', event.target.value)} error={form.errors.message} />
                </div>

                {showSelected && (
                    <div className="md:col-span-2">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Pilih Jamaah Manual</p>
                            <div className="flex gap-2">
                                <SecondaryButton type="button" onClick={onSelectAll}>Pilih Semua</SecondaryButton>
                                <SecondaryButton type="button" onClick={() => form.setData('congregant_ids', [])}>Kosongkan</SecondaryButton>
                            </div>
                        </div>
                        <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-2">
                            {congregants.map((congregant) => (
                                <label key={congregant.id} className="flex items-center justify-between gap-3 rounded-lg bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 shadow-xs">
                                    <span className="min-w-0">
                                        <span className="block truncate font-extrabold text-slate-900">{congregant.name}</span>
                                        <span className="block truncate text-[11px] text-slate-500">{congregant.phone} • {congregant.neighborhood || 'RT/RW -'}</span>
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(String(congregant.id))}
                                        onChange={(event) => onToggleCongregant(congregant.id, event.target.checked)}
                                        className="h-4 w-4 rounded border-teal-300 text-teal-600 focus:ring-teal-500"
                                    />
                                </label>
                            ))}
                            {congregants.length === 0 && <p className="rounded-lg border border-dashed border-teal-200 bg-white p-3 text-center text-xs font-semibold text-slate-500">Belum ada jamaah aktif dengan nomor WA.</p>}
                        </div>
                        {form.errors.congregant_ids && <p className="mt-1 text-[10px] font-semibold text-rose-600">{form.errors.congregant_ids}</p>}
                    </div>
                )}

                <div className="md:col-span-2 rounded-xl border border-sky-100 bg-sky-50 p-3 text-xs font-semibold leading-5 text-sky-700">
                    Target saat ini: <span className="font-extrabold">{targetCount} jamaah</span>. Batas aman aplikasi: maksimal 100 nomor per kampanye, minimal jeda 5 menit per nomor.
                </div>

                <div className="md:col-span-2">
                    <TextareaInput label="Catatan Internal" rows={3} value={form.data.notes || ''} onChange={(event) => form.setData('notes', event.target.value)} error={form.errors.notes} placeholder="Opsional, hanya untuk admin" />
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <PrimaryButton disabled={form.processing || !api?.enabled || targetCount === 0} className="gap-2">
                    <Megaphone className="h-4 w-4" />
                    {api?.enabled ? 'Buat Broadcast Bertahap' : 'API Belum Aktif'}
                </PrimaryButton>
                <SecondaryButton type="button" onClick={() => form.setData(emptyBroadcastForm)} className="gap-2">
                    <X className="h-4 w-4" />
                    Kosongkan
                </SecondaryButton>
            </div>
        </form>
    );
}

function NotificationHistory({ api, destroy, notifications, reuse, sendApi, whatsappUrl }) {
    return (
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
                            <StatusBadge meta={statusMeta} status={notification.status} />
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
                                <a className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-2 text-xs font-bold text-emerald-700" href={whatsappUrl(notification)} target="_blank" rel="noreferrer">
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
    );
}

function CampaignHistory({ campaigns }) {
    return (
        <section className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">Broadcast</p>
                    <h3 className="text-sm font-extrabold text-slate-950">Kampanye Bertahap</h3>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">{campaigns.length} kampanye</span>
            </div>
            <div className="mt-3 space-y-2">
                {campaigns.map((campaign) => (
                    <article key={campaign.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-extrabold text-slate-900">{campaign.title}</p>
                                <p className="mt-0.5 truncate text-[11px] font-bold text-teal-700">
                                    {label(campaign.category)} • {campaign.total_recipients} target • jeda {campaign.interval_minutes} menit
                                </p>
                            </div>
                            <StatusBadge meta={campaignStatusMeta} status={campaign.status} />
                        </div>
                        <div className="mt-2 grid gap-2 rounded-lg bg-slate-50 p-2 text-[11px] font-bold text-slate-600 sm:grid-cols-4">
                            <p>Total: {campaign.total_recipients}</p>
                            <p className="text-emerald-700">Berhasil: {campaign.sent_count}</p>
                            <p className="text-amber-700">Perlu Dicek: {campaign.pending_review_count}</p>
                            <p className="text-rose-700">Gagal: {campaign.failed_count}</p>
                        </div>
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            Mulai: {campaign.starts_at_display || '-'} • Dibuat: {campaign.created_at_display || '-'}
                        </p>
                        <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                            {(campaign.recipients || []).slice(0, 12).map((recipient) => (
                                <div key={recipient.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-600">
                                    <span className="min-w-0 truncate">
                                        #{recipient.sequence} {recipient.recipient_name} • {recipient.recipient_phone}
                                    </span>
                                    <StatusBadge meta={statusMeta} status={recipient.status} />
                                </div>
                            ))}
                            {(campaign.recipients || []).length > 12 && <p className="text-center text-[10px] font-bold text-slate-400">+{campaign.recipients.length - 12} penerima lain</p>}
                        </div>
                    </article>
                ))}
                {campaigns.length === 0 && <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-center text-xs font-semibold text-slate-500">Belum ada kampanye broadcast.</p>}
            </div>
        </section>
    );
}

function SectionTitle({ eyebrow, helper, icon: Icon, title }) {
    return (
        <div className="mb-4 flex items-center gap-2.5">
            <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">{eyebrow}</p>
                <h3 className="text-sm font-extrabold text-slate-950">{title}</h3>
                {helper && <p className="mt-0.5 text-xs font-medium text-slate-500">{helper}</p>}
            </div>
        </div>
    );
}

function TemplateSelect({ onChange, value }) {
    return (
        <div className="md:col-span-2">
            <SelectInput label="Template Pesan Cepat" value={value} onChange={(event) => onChange(event.target.value)}>
                <option value="">Tulis pesan sendiri</option>
                {messageTemplates.map((template) => (
                    <option key={template.key} value={template.key}>
                        {template.label}
                    </option>
                ))}
            </SelectInput>
        </div>
    );
}

function CategorySelect({ error, onChange, value }) {
    return (
        <SelectInput label="Kategori" value={value} onChange={onChange} error={error}>
            <option value="general">Umum</option>
            <option value="schedule">Kegiatan</option>
            <option value="booking">Booking</option>
            <option value="donation">Donasi</option>
            <option value="zakat">Zakat</option>
            <option value="qurban">Qurban</option>
            <option value="finance">Keuangan</option>
            <option value="announcement">Pengumuman</option>
        </SelectInput>
    );
}

function StatusBadge({ meta, status }) {
    return (
        <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${meta[status]?.tone || 'bg-slate-100 text-slate-600'}`}>
            {meta[status]?.label || label(status)}
        </span>
    );
}
