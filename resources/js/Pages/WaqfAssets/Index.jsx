import { router, useForm } from '@inertiajs/react';
import { Edit3, Gift, Landmark, MessageCircle, Plus, Sprout, Trash2, X } from 'lucide-react';
import StatCard from '../../Components/StatCard';
import { CheckboxInput, PrimaryButton, SecondaryButton, SelectInput, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { date, label, money } from '../../lib/formatters';

const emptyForm = {
    wakif_name: '',
    wakif_phone: '',
    asset_name: '',
    category: 'cash',
    description: '',
    estimated_value: '',
    received_at: '',
    certificate_number: '',
    location: '',
    status: 'managed',
    notes: '',
    send_whatsapp: true,
};

const statusTone = {
    pledged: 'bg-amber-100 text-amber-700',
    managed: 'bg-emerald-100 text-emerald-700',
    productive: 'bg-sky-100 text-sky-700',
    maintenance: 'bg-orange-100 text-orange-700',
    sold: 'bg-rose-100 text-rose-700',
    replaced: 'bg-violet-100 text-violet-700',
};

export default function Index({ assets, summary }) {
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);
    const editingId = data.id || null;

    const submit = (event) => {
        event.preventDefault();
        editingId
            ? put(`/wakaf/${editingId}`, { preserveScroll: true, onSuccess: () => resetForm() })
            : post('/wakaf', { preserveScroll: true, onSuccess: () => resetForm() });
    };

    const edit = (asset) => {
        setData({
            ...asset,
            received_at: asset.received_at?.slice(0, 10) || '',
            send_whatsapp: false,
        });
    };

    const resetForm = () => {
        reset();
        setData(emptyForm);
    };

    const destroy = (asset) => {
        if (window.confirm(`Hapus data wakaf "${asset.asset_name}"?`)) {
            router.delete(`/wakaf/${asset.id}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout title="Manajemen Wakaf">
            <section className="grid gap-4 md:grid-cols-4">
                <StatCard title="Total Wakaf" value={summary.total} helper="Semua data wakaf" icon={Gift} />
                <StatCard title="Dikelola" value={summary.managed} helper="Aset amanah" icon={Landmark} tone="emerald" />
                <StatCard title="Produktif" value={summary.productive} helper="Memberi manfaat" icon={Sprout} tone="sky" />
                <StatCard title="Nilai Estimasi" value={money(summary.value)} helper="Akumulasi aset" icon={Gift} tone="amber" />
            </section>

            <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={submit} className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2.5">
                        <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                            <Gift className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">
                                {editingId ? 'Ubah Wakaf' : 'Tambah Wakaf'}
                            </p>
                            <h3 className="text-sm font-extrabold text-slate-950">Aset Wakaf Masjid</h3>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <TextInput label="Nama Wakif" value={data.wakif_name} onChange={(event) => setData('wakif_name', event.target.value)} error={errors.wakif_name} />
                        <TextInput label="Nomor WA Wakif" value={data.wakif_phone || ''} onChange={(event) => setData('wakif_phone', event.target.value)} error={errors.wakif_phone} />
                        {!editingId && (
                            <div className="md:col-span-2 rounded-xl border border-teal-100 bg-teal-50/70 p-3">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                                            <MessageCircle className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">Konfirmasi WhatsApp</p>
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        <CheckboxInput label="Kirim WA" checked={Boolean(data.send_whatsapp)} onChange={(checked) => setData('send_whatsapp', checked)} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="md:col-span-2">
                            <TextInput label="Nama Aset Wakaf" value={data.asset_name} onChange={(event) => setData('asset_name', event.target.value)} error={errors.asset_name} />
                        </div>
                        <SelectInput label="Kategori" value={data.category} onChange={(event) => setData('category', event.target.value)} error={errors.category}>
                            <option value="cash">Uang</option>
                            <option value="land">Tanah</option>
                            <option value="building">Bangunan</option>
                            <option value="equipment">Peralatan</option>
                            <option value="vehicle">Kendaraan</option>
                            <option value="book">Kitab/Buku</option>
                            <option value="other">Lainnya</option>
                        </SelectInput>
                        <SelectInput label="Status" value={data.status} onChange={(event) => setData('status', event.target.value)} error={errors.status}>
                            <option value="pledged">Ikrar</option>
                            <option value="managed">Dikelola</option>
                            <option value="productive">Produktif</option>
                            <option value="maintenance">Perawatan</option>
                            <option value="sold">Dijual</option>
                            <option value="replaced">Diganti</option>
                        </SelectInput>
                        <TextInput label="Tanggal Terima" type="date" value={data.received_at || ''} onChange={(event) => setData('received_at', event.target.value)} error={errors.received_at} />
                        <TextInput label="Nilai Estimasi" type="number" value={data.estimated_value || ''} onChange={(event) => setData('estimated_value', event.target.value)} error={errors.estimated_value} />
                        <TextInput label="Nomor Sertifikat" value={data.certificate_number || ''} onChange={(event) => setData('certificate_number', event.target.value)} error={errors.certificate_number} />
                        <TextInput label="Lokasi" value={data.location || ''} onChange={(event) => setData('location', event.target.value)} error={errors.location} />
                        <div className="md:col-span-2">
                            <TextareaInput label="Deskripsi" value={data.description || ''} onChange={(event) => setData('description', event.target.value)} error={errors.description} />
                        </div>
                        <div className="md:col-span-2">
                            <TextareaInput label="Catatan" value={data.notes || ''} onChange={(event) => setData('notes', event.target.value)} error={errors.notes} />
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <PrimaryButton disabled={processing} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {editingId ? 'Simpan Wakaf' : 'Tambah Wakaf'}
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
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-950">Daftar Wakaf</h3>
                    <div className="mt-3 space-y-2">
                        {assets.map((asset) => (
                            <article key={asset.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-extrabold text-slate-900">{asset.asset_name}</p>
                                        <p className="mt-0.5 truncate text-[11px] font-bold text-teal-700">
                                            {label(asset.category)} • Wakif: {asset.wakif_name} • {date(asset.received_at)}
                                        </p>
                                    </div>
                                    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${statusTone[asset.status] || 'bg-slate-100 text-slate-600'}`}>
                                        {label(asset.status)}
                                    </span>
                                </div>
                                <div className="mt-2 grid gap-1 rounded-lg bg-slate-50 p-2 text-[11px] font-semibold text-slate-600 sm:grid-cols-2">
                                    <p className="truncate">Nilai: {money(asset.estimated_value)}</p>
                                    <p className="truncate">Lokasi: {asset.location || '-'}</p>
                                    <p className="truncate">Sertifikat: {asset.certificate_number || '-'}</p>
                                    <p className="truncate">Kontak: {asset.wakif_phone || '-'}</p>
                                </div>
                                <div className="mt-2 flex justify-end gap-2">
                                    <button className="rounded-lg bg-emerald-50 p-2 text-emerald-700" type="button" onClick={() => edit(asset)}>
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button className="rounded-lg bg-rose-50 p-2 text-rose-600" type="button" onClick={() => destroy(asset)}>
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </article>
                        ))}
                        {assets.length === 0 && <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-center text-xs font-semibold text-slate-500">Belum ada data wakaf.</p>}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
