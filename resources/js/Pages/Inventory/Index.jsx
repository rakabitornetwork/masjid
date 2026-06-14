import { router, useForm } from '@inertiajs/react';
import { Boxes, Edit3, Plus, Trash2, Wrench, X } from 'lucide-react';
import StatCard from '../../Components/StatCard';
import { CheckboxInput, PrimaryButton, SecondaryButton, SelectInput, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { date, label, money } from '../../lib/formatters';

const emptyForm = {
    name: '',
    category: '',
    quantity: 1,
    unit: 'unit',
    condition: 'good',
    location: '',
    purchased_at: '',
    estimated_value: '',
    maintenance_due_at: '',
    is_active: true,
    notes: '',
};

export default function Index({ items, summary }) {
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);
    const editingId = data.id || null;

    const submit = (event) => {
        event.preventDefault();
        editingId ? put(`/inventaris/${editingId}`, { onSuccess: () => resetForm() }) : post('/inventaris', { onSuccess: () => resetForm() });
    };

    const edit = (item) => {
        setData({
            ...item,
            purchased_at: item.purchased_at?.slice(0, 10) || '',
            maintenance_due_at: item.maintenance_due_at?.slice(0, 10) || '',
        });
    };

    const resetForm = () => {
        reset();
        setData(emptyForm);
    };

    const destroy = (item) => {
        if (window.confirm(`Hapus inventaris "${item.name}"?`)) {
            router.delete(`/inventaris/${item.id}`);
        }
    };

    return (
        <AppLayout title="Inventaris Masjid">
            <section className="grid gap-4 md:grid-cols-4">
                <StatCard title="Total Barang" value={summary.total} helper="Semua inventaris" icon={Boxes} />
                <StatCard title="Barang Aktif" value={summary.active} helper="Masih digunakan" icon={Boxes} tone="sky" />
                <StatCard title="Nilai Estimasi" value={money(summary.value)} helper="Barang aktif" icon={Boxes} tone="amber" />
                <StatCard title="Perlu Perawatan" value={summary.maintenance} helper="Jatuh tempo 30 hari" icon={Wrench} tone="rose" />
            </section>

            <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[0.85fr_1.15fr]">
                <form onSubmit={submit} className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2.5">
                        <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                            <Boxes className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">
                                {editingId ? 'Ubah Inventaris' : 'Tambah Inventaris'}
                            </p>
                            <h3 className="text-sm font-extrabold text-slate-950">Data Barang Masjid</h3>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <TextInput label="Nama Barang" value={data.name} onChange={(event) => setData('name', event.target.value)} error={errors.name} />
                        <TextInput label="Kategori" value={data.category || ''} onChange={(event) => setData('category', event.target.value)} error={errors.category} />
                        <TextInput label="Jumlah" type="number" value={data.quantity} onChange={(event) => setData('quantity', event.target.value)} error={errors.quantity} />
                        <TextInput label="Satuan" value={data.unit} onChange={(event) => setData('unit', event.target.value)} error={errors.unit} />
                        <SelectInput label="Kondisi" value={data.condition} onChange={(event) => setData('condition', event.target.value)} error={errors.condition}>
                            <option value="good">Baik</option>
                            <option value="minor_damage">Rusak Ringan</option>
                            <option value="damaged">Rusak</option>
                            <option value="maintenance">Perawatan</option>
                        </SelectInput>
                        <TextInput label="Lokasi" value={data.location || ''} onChange={(event) => setData('location', event.target.value)} error={errors.location} />
                        <TextInput label="Tanggal Beli" type="date" value={data.purchased_at || ''} onChange={(event) => setData('purchased_at', event.target.value)} error={errors.purchased_at} />
                        <TextInput label="Nilai Estimasi" type="number" value={data.estimated_value || ''} onChange={(event) => setData('estimated_value', event.target.value)} error={errors.estimated_value} />
                        <TextInput label="Jadwal Perawatan" type="date" value={data.maintenance_due_at || ''} onChange={(event) => setData('maintenance_due_at', event.target.value)} error={errors.maintenance_due_at} />
                        <CheckboxInput label="Aktif" checked={Boolean(data.is_active)} onChange={(value) => setData('is_active', value)} />
                        <div className="md:col-span-2">
                            <TextareaInput label="Catatan" value={data.notes || ''} onChange={(event) => setData('notes', event.target.value)} error={errors.notes} />
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <PrimaryButton disabled={processing} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {editingId ? 'Simpan Perubahan' : 'Tambah Inventaris'}
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
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-950">Daftar Inventaris</h3>
                    <div className="mt-3 space-y-2">
                        {items.map((item) => (
                            <article key={item.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-extrabold text-slate-900">{item.name}</p>
                                        <p className="mt-0.5 truncate text-[11px] font-bold text-teal-700">
                                            {item.category || 'Tanpa kategori'} • {item.quantity} {item.unit}
                                        </p>
                                    </div>
                                    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${item.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>
                                <div className="mt-2 grid gap-1 rounded-lg bg-slate-50 p-2 text-[11px] font-semibold text-slate-600 sm:grid-cols-2">
                                    <p className="truncate">Kondisi: {label(item.condition)}</p>
                                    <p className="truncate">Lokasi: {item.location || '-'}</p>
                                    <p className="truncate">Nilai: {money(item.estimated_value)}</p>
                                    <p className="truncate">Perawatan: {date(item.maintenance_due_at)}</p>
                                </div>
                                <div className="mt-2 flex justify-end gap-2">
                                    <button className="rounded-lg bg-emerald-50 p-2 text-emerald-700" type="button" onClick={() => edit(item)}>
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button className="rounded-lg bg-rose-50 p-2 text-rose-600" type="button" onClick={() => destroy(item)}>
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </article>
                        ))}
                        {items.length === 0 && <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-center text-xs font-semibold text-slate-500">Belum ada inventaris.</p>}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
