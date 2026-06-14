import { router, useForm } from '@inertiajs/react';
import { CheckCircle2, Clock, Edit3, Plus, Trash2, Wrench, X } from 'lucide-react';
import StatCard from '../../Components/StatCard';
import { PrimaryButton, SecondaryButton, SelectInput, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { date, label, money } from '../../lib/formatters';

const emptyForm = {
    inventory_item_id: '',
    maintenance_date: '',
    type: 'routine',
    handled_by: '',
    cost: '',
    status: 'scheduled',
    description: '',
    next_due_at: '',
};

const statusTone = {
    scheduled: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-sky-100 text-sky-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-slate-100 text-slate-600',
};

export default function Index({ maintenances, items, summary }) {
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);
    const editingId = data.id || null;

    const submit = (event) => {
        event.preventDefault();
        editingId
            ? put(`/perawatan-inventaris/${editingId}`, { preserveScroll: true, onSuccess: () => resetForm() })
            : post('/perawatan-inventaris', { preserveScroll: true, onSuccess: () => resetForm() });
    };

    const edit = (maintenance) => {
        setData({
            ...maintenance,
            inventory_item_id: maintenance.inventory_item_id || maintenance.item?.id || '',
            maintenance_date: maintenance.maintenance_date?.slice(0, 10) || '',
            next_due_at: maintenance.next_due_at?.slice(0, 10) || '',
        });
    };

    const resetForm = () => {
        reset();
        setData(emptyForm);
    };

    const destroy = (maintenance) => {
        if (window.confirm(`Hapus riwayat perawatan ${maintenance.item?.name || 'inventaris'}?`)) {
            router.delete(`/perawatan-inventaris/${maintenance.id}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout title="Perawatan Inventaris">
            <section className="grid gap-4 md:grid-cols-4">
                <StatCard title="Total Riwayat" value={summary.total} helper="Semua perawatan" icon={Wrench} />
                <StatCard title="Terjadwal" value={summary.scheduled} helper="Menunggu pengerjaan" icon={Clock} tone="amber" />
                <StatCard title="Selesai" value={summary.completed} helper="Sudah dikerjakan" icon={CheckCircle2} tone="emerald" />
                <StatCard title="Total Biaya" value={money(summary.cost)} helper="Akumulasi biaya" icon={Wrench} tone="sky" />
            </section>

            <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={submit} className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2.5">
                        <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                            <Wrench className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">
                                {editingId ? 'Ubah Perawatan' : 'Tambah Perawatan'}
                            </p>
                            <h3 className="text-sm font-extrabold text-slate-950">Riwayat Maintenance Barang</h3>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <SelectInput label="Barang Inventaris" value={data.inventory_item_id} onChange={(event) => setData('inventory_item_id', event.target.value)} error={errors.inventory_item_id}>
                                <option value="">Pilih barang</option>
                                {items.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name} {item.location ? `- ${item.location}` : ''}
                                    </option>
                                ))}
                            </SelectInput>
                        </div>
                        <SelectInput label="Jenis Perawatan" value={data.type} onChange={(event) => setData('type', event.target.value)} error={errors.type}>
                            <option value="routine">Rutin</option>
                            <option value="repair">Perbaikan</option>
                            <option value="inspection">Inspeksi</option>
                            <option value="cleaning">Pembersihan</option>
                            <option value="other">Lainnya</option>
                        </SelectInput>
                        <SelectInput label="Status" value={data.status} onChange={(event) => setData('status', event.target.value)} error={errors.status}>
                            <option value="scheduled">Terjadwal</option>
                            <option value="in_progress">Dikerjakan</option>
                            <option value="completed">Selesai</option>
                            <option value="cancelled">Dibatalkan</option>
                        </SelectInput>
                        <TextInput label="Tanggal Perawatan" type="date" value={data.maintenance_date} onChange={(event) => setData('maintenance_date', event.target.value)} error={errors.maintenance_date} />
                        <TextInput label="Jadwal Berikutnya" type="date" value={data.next_due_at || ''} onChange={(event) => setData('next_due_at', event.target.value)} error={errors.next_due_at} />
                        <TextInput label="Penanggung Jawab" value={data.handled_by || ''} onChange={(event) => setData('handled_by', event.target.value)} error={errors.handled_by} />
                        <TextInput label="Biaya" type="number" value={data.cost || ''} onChange={(event) => setData('cost', event.target.value)} error={errors.cost} />
                        <div className="md:col-span-2">
                            <TextareaInput label="Deskripsi / Catatan Perawatan" value={data.description || ''} onChange={(event) => setData('description', event.target.value)} error={errors.description} />
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <PrimaryButton disabled={processing} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {editingId ? 'Simpan Perawatan' : 'Tambah Perawatan'}
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
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-950">Riwayat Perawatan</h3>
                    <div className="mt-3 space-y-2">
                        {maintenances.map((maintenance) => (
                            <article key={maintenance.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-extrabold text-slate-900">{maintenance.item?.name || 'Inventaris'}</p>
                                        <p className="mt-0.5 truncate text-[11px] font-bold text-teal-700">
                                            {label(maintenance.type)} • {date(maintenance.maintenance_date)} • {money(maintenance.cost)}
                                        </p>
                                    </div>
                                    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${statusTone[maintenance.status] || 'bg-slate-100 text-slate-600'}`}>
                                        {label(maintenance.status)}
                                    </span>
                                </div>
                                <div className="mt-2 grid gap-1 rounded-lg bg-slate-50 p-2 text-[11px] font-semibold text-slate-600 sm:grid-cols-2">
                                    <p className="truncate">PJ: {maintenance.handled_by || '-'}</p>
                                    <p className="truncate">Berikutnya: {date(maintenance.next_due_at)}</p>
                                    <p className="truncate sm:col-span-2">Catatan: {maintenance.description || '-'}</p>
                                </div>
                                <div className="mt-2 flex justify-end gap-2">
                                    <button className="rounded-lg bg-emerald-50 p-2 text-emerald-700" type="button" onClick={() => edit(maintenance)}>
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button className="rounded-lg bg-rose-50 p-2 text-rose-600" type="button" onClick={() => destroy(maintenance)}>
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </article>
                        ))}
                        {maintenances.length === 0 && <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-center text-xs font-semibold text-slate-500">Belum ada riwayat perawatan.</p>}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
