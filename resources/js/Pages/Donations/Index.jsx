import { router, useForm } from '@inertiajs/react';
import { Edit3, HeartHandshake, Plus, Trash2, X } from 'lucide-react';
import StatCard from '../../Components/StatCard';
import { CheckboxInput, PrimaryButton, SecondaryButton, SelectInput, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { date, label, money } from '../../lib/formatters';

const today = new Date().toISOString().slice(0, 10);

const emptyCampaign = {
    title: '',
    category: 'infaq',
    description: '',
    target_amount: '',
    start_date: '',
    end_date: '',
    status: 'active',
    is_featured: true,
};

const emptyEntry = {
    donation_campaign_id: '',
    donor_name: '',
    donor_phone: '',
    amount: '',
    payment_method: 'transfer',
    donated_at: today,
    status: 'confirmed',
    notes: '',
};

export default function Index({ campaigns, entries, summary }) {
    const campaignForm = useForm(emptyCampaign);
    const entryForm = useForm({
        ...emptyEntry,
        donation_campaign_id: campaigns[0]?.id || '',
    });
    const editingId = campaignForm.data.id || null;

    const submitCampaign = (event) => {
        event.preventDefault();
        editingId
            ? campaignForm.put(`/donasi/${editingId}`, { onSuccess: () => resetCampaign() })
            : campaignForm.post('/donasi', { onSuccess: () => resetCampaign() });
    };

    const submitEntry = (event) => {
        event.preventDefault();
        entryForm.post('/donasi/catatan', {
            onSuccess: () => entryForm.setData({
                ...emptyEntry,
                donation_campaign_id: entryForm.data.donation_campaign_id,
            }),
        });
    };

    const editCampaign = (campaign) => {
        campaignForm.setData({
            ...campaign,
            start_date: campaign.start_date?.slice(0, 10) || '',
            end_date: campaign.end_date?.slice(0, 10) || '',
        });
    };

    const resetCampaign = () => {
        campaignForm.reset();
        campaignForm.setData(emptyCampaign);
    };

    const destroyCampaign = (campaign) => {
        if (window.confirm(`Hapus program donasi "${campaign.title}"? Semua catatan donatur di program ini ikut terhapus.`)) {
            router.delete(`/donasi/${campaign.id}`);
        }
    };

    const destroyEntry = (entry) => {
        if (window.confirm('Hapus catatan donasi ini?')) {
            router.delete(`/donasi/catatan/${entry.id}`);
        }
    };

    return (
        <AppLayout title="Donasi / Infaq Online">
            <section className="grid gap-4 md:grid-cols-3">
                <StatCard title="Program Aktif" value={summary.active} helper="Campaign berjalan" icon={HeartHandshake} />
                <StatCard title="Terkumpul" value={money(summary.collected)} helper="Donasi confirmed" icon={HeartHandshake} tone="sky" />
                <StatCard title="Jumlah Donatur" value={summary.donors} helper="Catatan confirmed" icon={HeartHandshake} tone="amber" />
            </section>

            <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[0.8fr_1.2fr]">
                <div className="space-y-4">
                    <form onSubmit={submitCampaign} className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                        <div className="mb-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">
                                {editingId ? 'Ubah Program' : 'Tambah Program'}
                            </p>
                            <h3 className="text-sm font-extrabold text-slate-950">Campaign Donasi / Infaq</h3>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                            <TextInput label="Judul Program" value={campaignForm.data.title} onChange={(event) => campaignForm.setData('title', event.target.value)} error={campaignForm.errors.title} />
                            <SelectInput label="Kategori" value={campaignForm.data.category} onChange={(event) => campaignForm.setData('category', event.target.value)} error={campaignForm.errors.category}>
                                <option value="infaq">Infaq</option>
                                <option value="renovasi">Renovasi</option>
                                <option value="sosial">Sosial</option>
                                <option value="pendidikan">Pendidikan</option>
                                <option value="operasional">Operasional</option>
                            </SelectInput>
                            <TextInput label="Target Dana" type="number" value={campaignForm.data.target_amount || ''} onChange={(event) => campaignForm.setData('target_amount', event.target.value)} error={campaignForm.errors.target_amount} />
                            <SelectInput label="Status" value={campaignForm.data.status} onChange={(event) => campaignForm.setData('status', event.target.value)} error={campaignForm.errors.status}>
                                <option value="active">Aktif</option>
                                <option value="paused">Dijeda</option>
                                <option value="completed">Selesai</option>
                            </SelectInput>
                            <TextInput label="Mulai" type="date" value={campaignForm.data.start_date || ''} onChange={(event) => campaignForm.setData('start_date', event.target.value)} error={campaignForm.errors.start_date} />
                            <TextInput label="Selesai" type="date" value={campaignForm.data.end_date || ''} onChange={(event) => campaignForm.setData('end_date', event.target.value)} error={campaignForm.errors.end_date} />
                            <div className="md:col-span-2">
                                <TextareaInput label="Deskripsi" value={campaignForm.data.description || ''} onChange={(event) => campaignForm.setData('description', event.target.value)} error={campaignForm.errors.description} />
                            </div>
                            <CheckboxInput label="Tampilkan di landing page" checked={Boolean(campaignForm.data.is_featured)} onChange={(value) => campaignForm.setData('is_featured', value)} />
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <PrimaryButton disabled={campaignForm.processing} className="gap-2">
                                <Plus className="h-4 w-4" />
                                {editingId ? 'Simpan Program' : 'Tambah Program'}
                            </PrimaryButton>
                            {editingId && (
                                <SecondaryButton type="button" onClick={resetCampaign} className="gap-2">
                                    <X className="h-4 w-4" />
                                    Batal
                                </SecondaryButton>
                            )}
                        </div>
                    </form>

                    <form onSubmit={submitEntry} className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">Catat Donatur</p>
                        <h3 className="text-sm font-extrabold text-slate-950">Histori Donasi Masuk</h3>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <SelectInput label="Program" value={entryForm.data.donation_campaign_id} onChange={(event) => entryForm.setData('donation_campaign_id', event.target.value)} error={entryForm.errors.donation_campaign_id}>
                                <option value="">Pilih program</option>
                                {campaigns.map((campaign) => (
                                    <option key={campaign.id} value={campaign.id}>{campaign.title}</option>
                                ))}
                            </SelectInput>
                            <TextInput label="Nominal" type="number" value={entryForm.data.amount} onChange={(event) => entryForm.setData('amount', event.target.value)} error={entryForm.errors.amount} />
                            <TextInput label="Nama Donatur" value={entryForm.data.donor_name || ''} onChange={(event) => entryForm.setData('donor_name', event.target.value)} error={entryForm.errors.donor_name} />
                            <TextInput label="Telepon" value={entryForm.data.donor_phone || ''} onChange={(event) => entryForm.setData('donor_phone', event.target.value)} error={entryForm.errors.donor_phone} />
                            <SelectInput label="Metode" value={entryForm.data.payment_method} onChange={(event) => entryForm.setData('payment_method', event.target.value)} error={entryForm.errors.payment_method}>
                                <option value="cash">Tunai</option>
                                <option value="transfer">Transfer</option>
                                <option value="qris">QRIS</option>
                                <option value="e_wallet">E-Wallet</option>
                            </SelectInput>
                            <TextInput label="Tanggal" type="date" value={entryForm.data.donated_at} onChange={(event) => entryForm.setData('donated_at', event.target.value)} error={entryForm.errors.donated_at} />
                            <SelectInput label="Status" value={entryForm.data.status} onChange={(event) => entryForm.setData('status', event.target.value)} error={entryForm.errors.status}>
                                <option value="confirmed">Confirmed</option>
                                <option value="pending">Pending</option>
                                <option value="cancelled">Cancelled</option>
                            </SelectInput>
                            <div className="md:col-span-2">
                                <TextareaInput label="Catatan" value={entryForm.data.notes || ''} onChange={(event) => entryForm.setData('notes', event.target.value)} error={entryForm.errors.notes} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <PrimaryButton disabled={entryForm.processing || campaigns.length === 0} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Catat Donasi
                            </PrimaryButton>
                        </div>
                    </form>
                </div>

                <section className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-950">Program Donasi</h3>
                    <div className="mt-3 space-y-2">
                        {campaigns.map((campaign) => (
                            <article key={campaign.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-extrabold text-slate-900">{campaign.title}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-700">{label(campaign.category)} • {label(campaign.status)}</p>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        <button className="rounded-lg bg-emerald-50 p-2 text-emerald-700" type="button" onClick={() => editCampaign(campaign)}>
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                        <button className="rounded-lg bg-rose-50 p-2 text-rose-600" type="button" onClick={() => destroyCampaign(campaign)}>
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${campaign.progress_percent}%` }} />
                                </div>
                                <div className="mt-2 flex items-center justify-between gap-2 text-[11px] font-bold text-slate-500">
                                    <span>{money(campaign.collected_amount)} terkumpul</span>
                                    <span>{campaign.target_amount > 0 ? money(campaign.target_amount) : 'Tanpa target'}</span>
                                </div>
                            </article>
                        ))}
                        {campaigns.length === 0 && <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-center text-xs font-semibold text-slate-500">Belum ada program donasi.</p>}
                    </div>

                    <h3 className="mt-5 text-xs font-extrabold uppercase tracking-[0.14em] text-slate-950">Donatur Terbaru</h3>
                    <div className="mt-3 space-y-2">
                        {entries.map((entry) => (
                            <article key={entry.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="truncate text-xs font-extrabold text-slate-950">{entry.donor_name || 'Hamba Allah'}</p>
                                        <p className="truncate text-[10px] font-semibold text-slate-500">{entry.campaign?.title || '-'} • {date(entry.donated_at)}</p>
                                    </div>
                                    <p className="shrink-0 text-xs font-black text-emerald-600">{money(entry.amount)}</p>
                                </div>
                                <div className="mt-2 flex items-center justify-between gap-2">
                                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-teal-700">{label(entry.payment_method)} • {label(entry.status)}</span>
                                    <button className="text-rose-600" type="button" onClick={() => destroyEntry(entry)}>
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </article>
                        ))}
                        {entries.length === 0 && <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-center text-xs font-semibold text-slate-500">Belum ada catatan donasi.</p>}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
