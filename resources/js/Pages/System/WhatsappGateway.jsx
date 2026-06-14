import { router } from '@inertiajs/react';
import { CheckCircle2, MessageCircle, Power, QrCode, RefreshCw, RotateCcw, Server, ShieldAlert, Smartphone } from 'lucide-react';
import StatCard from '../../Components/StatCard';
import AppLayout from '../../Layouts/AppLayout';

export default function WhatsappGateway({ provider, health, qr }) {
    const data = health?.data || {};
    const qrData = qr?.data || {};
    const connected = Boolean(data.session_ready);
    const hasQr = Boolean(qrData.has_qr && qrData.qr_png_base64);

    const refresh = () => router.reload({ preserveScroll: true });

    const restartGateway = () => {
        if (window.confirm('Restart Baileys Gateway Masjid sekarang? Proses PM2 akan menghidupkan ulang jika autorestart aktif.')) {
            router.post('/pengaturan-gateway-wa/restart', {}, { preserveScroll: true });
        }
    };

    const resetSession = () => {
        if (window.confirm('Reset session WhatsApp dan minta QR baru? Nomor masjid harus scan ulang.')) {
            router.post('/pengaturan-gateway-wa/reset-session', {}, { preserveScroll: true });
        }
    };

    return (
        <AppLayout title="Pengaturan Gateway WA">
            <section className="grid gap-4 md:grid-cols-4">
                <StatCard title="Provider" value={provider.label} helper={provider.enabled ? 'Konfigurasi aktif' : 'Belum aktif'} icon={MessageCircle} />
                <StatCard title="Gateway" value={health?.ok ? 'Terjangkau' : 'Tidak Aktif'} helper={provider.baseUrl || '-'} icon={Server} tone={health?.ok ? 'emerald' : 'rose'} />
                <StatCard title="Session" value={connected ? 'Connected' : 'Belum Login'} helper={data.connection_state || '-'} icon={Smartphone} tone={connected ? 'emerald' : 'amber'} />
                <StatCard title="QR" value={hasQr ? 'Tersedia' : 'Tidak Ada'} helper={hasQr ? 'Scan dari WhatsApp' : 'Refresh / restart gateway'} icon={QrCode} tone={hasQr ? 'sky' : 'amber'} />
            </section>

            {provider.key !== 'baileys' && (
                <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs font-semibold text-amber-700">
                    Provider WhatsApp saat ini bukan Baileys. Ubah `.env` menjadi `WHATSAPP_PROVIDER=baileys` dan aktifkan `BAILEYS_BASE_URL` untuk memakai halaman ini.
                </div>
            )}

            <section className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-4">
                    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">Status Gateway</p>
                                <h3 className="text-sm font-extrabold text-slate-950">Baileys Gateway Masjid</h3>
                            </div>
                            <button type="button" onClick={refresh} className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700">
                                <RefreshCw className="h-4 w-4" />
                                Refresh
                            </button>
                        </div>

                        <div className="space-y-2">
                            <InfoRow label="Provider" value={provider.label} />
                            <InfoRow label="Base URL" value={provider.baseUrl} />
                            <InfoRow label="HTTP Status" value={health?.status || '-'} />
                            <InfoRow label="Pesan" value={health?.message || '-'} />
                            <InfoRow label="Process PID" value={data.process_pid || '-'} />
                            <InfoRow label="Session Folder" value={data.session_dir || '-'} />
                            <InfoRow label="Linked Phone" value={data.linked_phone || '-'} />
                            <InfoRow label="Device" value={data.device_name || '-'} />
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">Aksi Admin</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <button type="button" onClick={restartGateway} className="inline-flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700">
                                <Power className="h-4 w-4" />
                                Restart Gateway
                            </button>
                            <button type="button" onClick={resetSession} className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                                <RotateCcw className="h-4 w-4" />
                                Reset Session & QR
                            </button>
                        </div>
                        <p className="mt-3 rounded-lg bg-slate-50 p-2 text-[11px] font-semibold leading-5 text-slate-500">
                            Gunakan reset session hanya jika nomor WhatsApp masjid logout, QR tidak muncul, atau ingin menautkan ulang perangkat.
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2.5">
                        <div className={`rounded-lg p-2 ${connected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {connected ? <CheckCircle2 className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">Scan QR WhatsApp</p>
                            <h3 className="text-sm font-extrabold text-slate-950">{connected ? 'Gateway sudah terhubung' : 'Menunggu scan QR'}</h3>
                        </div>
                    </div>

                    <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-teal-100 bg-teal-50/40 p-4">
                        {connected ? (
                            <div className="text-center">
                                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                                <p className="mt-3 text-sm font-extrabold text-slate-900">Nomor masjid sudah tertaut.</p>
                                <p className="mt-1 text-xs font-semibold text-slate-500">Linked phone: {data.linked_phone || '-'}</p>
                            </div>
                        ) : hasQr ? (
                            <div className="text-center">
                                <img className="mx-auto h-64 w-64 rounded-xl bg-white p-3 shadow-sm" src={`data:image/png;base64,${qrData.qr_png_base64}`} alt="QR WhatsApp Gateway" />
                                <p className="mt-3 text-xs font-bold text-slate-600">Scan dari WhatsApp: Perangkat tertaut &gt; Tautkan perangkat.</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <QrCode className="mx-auto h-12 w-12 text-amber-500" />
                                <p className="mt-3 text-sm font-extrabold text-slate-900">QR belum tersedia.</p>
                                <p className="mt-1 text-xs font-semibold text-slate-500">{qr?.message || 'Klik refresh atau restart gateway.'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 last:border-b-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</span>
            <span className="truncate text-right text-xs font-bold text-slate-800">{value || '-'}</span>
        </div>
    );
}
