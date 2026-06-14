import { router, useForm } from '@inertiajs/react';
import { Edit3, Home, Plus, Trash2, Users, X } from 'lucide-react';
import StatCard from '../../Components/StatCard';
import { CheckboxInput, PrimaryButton, SecondaryButton, SelectInput, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { label } from '../../lib/formatters';

const emptyForm = {
    family_head_name: '',
    phone: '',
    address: '',
    neighborhood: '',
    economic_status: '',
    is_active: true,
    notes: '',
};

export default function Index({ families, summary }) {
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);
    const editingId = data.id || null;

    const submit = (event) => {
        event.preventDefault();
        editingId
            ? put(`/keluarga-jamaah/${editingId}`, { preserveScroll: true, onSuccess: () => resetForm() })
            : post('/keluarga-jamaah', { preserveScroll: true, onSuccess: () => resetForm() });
    };

    const edit = (family) => {
        setData(family);
    };

    const resetForm = () => {
        reset();
        setData(emptyForm);
    };

    const destroy = (family) => {
        if (window.confirm(`Hapus keluarga ${family.family_head_name}? Relasi jamaah akan dikosongkan.`)) {
            router.delete(`/keluarga-jamaah/${family.id}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout title="Keluarga Jamaah">
            <section className="grid gap-4 md:grid-cols-3">
                <StatCard title="Total Keluarga" value={summary.total} helper="Semua keluarga jamaah" icon={Users} />
                <StatCard title="Keluarga Aktif" value={summary.active} helper="Masih aktif terdata" icon={Home} tone="sky" />
                <StatCard title="Anggota Tertaut" value={summary.members} helper="Jamaah punya keluarga" icon={Users} tone="amber" />
            </section>

            <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[0.85fr_1.15fr]">
                <form onSubmit={submit} className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2.5">
                        <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                            <Users className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">
                                {editingId ? 'Ubah Keluarga' : 'Tambah Keluarga'}
                            </p>
                            <h3 className="text-sm font-extrabold text-slate-950">Data Keluarga Jamaah</h3>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <TextInput label="Nama Kepala Keluarga" value={data.family_head_name} onChange={(event) => setData('family_head_name', event.target.value)} error={errors.family_head_name} />
                        </div>
                        <TextInput label="Nomor WA / Telepon" value={data.phone || ''} onChange={(event) => setData('phone', event.target.value)} error={errors.phone} />
                        <TextInput label="RT/RW" value={data.neighborhood || ''} onChange={(event) => setData('neighborhood', event.target.value)} error={errors.neighborhood} />
                        <SelectInput label="Segmentasi" value={data.economic_status || ''} onChange={(event) => setData('economic_status', event.target.value)} error={errors.economic_status}>
                            <option value="">Pilih segmentasi</option>
                            <option value="regular">Reguler</option>
                            <option value="duafa">Dhuafa</option>
                            <option value="priority">Prioritas Layanan</option>
                            <option value="donor">Donatur</option>
                        </SelectInput>
                        <CheckboxInput label="Aktif" checked={Boolean(data.is_active)} onChange={(value) => setData('is_active', value)} />
                        <div className="md:col-span-2">
                            <TextareaInput label="Alamat" value={data.address || ''} onChange={(event) => setData('address', event.target.value)} error={errors.address} />
                        </div>
                        <div className="md:col-span-2">
                            <TextareaInput label="Catatan" value={data.notes || ''} onChange={(event) => setData('notes', event.target.value)} error={errors.notes} />
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <PrimaryButton disabled={processing} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {editingId ? 'Simpan Keluarga' : 'Tambah Keluarga'}
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
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-950">Daftar Keluarga Jamaah</h3>
                    <div className="mt-3 space-y-2">
                        {families.map((family) => (
                            <article key={family.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-extrabold text-slate-900">{family.family_head_name}</p>
                                        <p className="mt-0.5 truncate text-[11px] font-bold text-teal-700">
                                            {family.neighborhood || 'RT/RW -'} • {label(family.economic_status || 'regular')} • {family.congregants_count} anggota
                                        </p>
                                    </div>
                                    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${family.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {family.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>
                                <div className="mt-2 grid gap-1 rounded-lg bg-slate-50 p-2 text-[11px] font-semibold text-slate-600 sm:grid-cols-2">
                                    <p className="truncate">Kontak: {family.phone || '-'}</p>
                                    <p className="truncate">Segmentasi: {label(family.economic_status || 'regular')}</p>
                                    <p className="truncate sm:col-span-2">Alamat: {family.address || '-'}</p>
                                </div>
                                <div className="mt-2 flex justify-end gap-2">
                                    <button className="rounded-lg bg-emerald-50 p-2 text-emerald-700" type="button" onClick={() => edit(family)}>
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button className="rounded-lg bg-rose-50 p-2 text-rose-600" type="button" onClick={() => destroy(family)}>
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </article>
                        ))}
                        {families.length === 0 && <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-center text-xs font-semibold text-slate-500">Belum ada data keluarga jamaah.</p>}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
