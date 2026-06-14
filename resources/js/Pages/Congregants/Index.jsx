import { router, useForm } from '@inertiajs/react';
import { Edit3, Plus, Trash2, UserRound, UsersRound, X } from 'lucide-react';
import StatCard from '../../Components/StatCard';
import { CheckboxInput, PrimaryButton, SecondaryButton, SelectInput, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { date } from '../../lib/formatters';

const emptyForm = {
    name: '',
    family_head: '',
    gender: 'male',
    birth_date: '',
    phone: '',
    email: '',
    address: '',
    neighborhood: '',
    occupation: '',
    marital_status: '',
    is_active: true,
    notes: '',
};

export default function Index({ congregants, summary }) {
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);
    const editingId = data.id || null;

    const submit = (event) => {
        event.preventDefault();
        editingId ? put(`/jamaah/${editingId}`, { onSuccess: () => resetForm() }) : post('/jamaah', { onSuccess: () => resetForm() });
    };

    const edit = (congregant) => {
        setData({
            ...congregant,
            birth_date: congregant.birth_date?.slice(0, 10) || '',
        });
    };

    const resetForm = () => {
        reset();
        setData(emptyForm);
    };

    const destroy = (congregant) => {
        if (window.confirm(`Hapus data jamaah ${congregant.name}?`)) {
            router.delete(`/jamaah/${congregant.id}`);
        }
    };

    return (
        <AppLayout title="Data Jamaah">
            <section className="grid gap-4 md:grid-cols-3">
                <StatCard title="Total Jamaah" value={summary.total} helper="Semua data jamaah" icon={UsersRound} />
                <StatCard title="Jamaah Aktif" value={summary.active} helper="Masih aktif terdata" icon={UserRound} tone="sky" />
                <StatCard title="Keluarga" value={summary.families} helper="Berdasarkan kepala keluarga" icon={UsersRound} tone="amber" />
            </section>

            <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[0.85fr_1.15fr]">
                <form onSubmit={submit} className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2.5">
                        <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                            <UsersRound className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">
                                {editingId ? 'Ubah Jamaah' : 'Tambah Jamaah'}
                            </p>
                            <h3 className="text-sm font-extrabold text-slate-950">Manajemen Data Jamaah</h3>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <TextInput label="Nama Jamaah" value={data.name} onChange={(event) => setData('name', event.target.value)} error={errors.name} />
                        <TextInput label="Kepala Keluarga" value={data.family_head || ''} onChange={(event) => setData('family_head', event.target.value)} error={errors.family_head} />
                        <SelectInput label="Jenis Kelamin" value={data.gender} onChange={(event) => setData('gender', event.target.value)} error={errors.gender}>
                            <option value="male">Laki-laki</option>
                            <option value="female">Perempuan</option>
                        </SelectInput>
                        <TextInput label="Tanggal Lahir" type="date" value={data.birth_date || ''} onChange={(event) => setData('birth_date', event.target.value)} error={errors.birth_date} />
                        <TextInput label="Telepon" value={data.phone || ''} onChange={(event) => setData('phone', event.target.value)} error={errors.phone} />
                        <TextInput label="Email" type="email" value={data.email || ''} onChange={(event) => setData('email', event.target.value)} error={errors.email} />
                        <TextInput label="RT/RW" value={data.neighborhood || ''} onChange={(event) => setData('neighborhood', event.target.value)} error={errors.neighborhood} />
                        <TextInput label="Pekerjaan" value={data.occupation || ''} onChange={(event) => setData('occupation', event.target.value)} error={errors.occupation} />
                        <SelectInput label="Status Nikah" value={data.marital_status || ''} onChange={(event) => setData('marital_status', event.target.value)} error={errors.marital_status}>
                            <option value="">Pilih status</option>
                            <option value="single">Belum menikah</option>
                            <option value="married">Menikah</option>
                            <option value="widowed">Duda/Janda</option>
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
                            {editingId ? 'Simpan Perubahan' : 'Tambah Jamaah'}
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
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-950">Daftar Jamaah</h3>
                    <div className="mt-3 space-y-2">
                        {congregants.map((congregant) => (
                            <article key={congregant.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-extrabold text-slate-900">{congregant.name}</p>
                                        <p className="mt-0.5 truncate text-[11px] font-bold text-teal-700">
                                            {congregant.family_head || 'Kepala keluarga belum diisi'} • {congregant.neighborhood || 'RT/RW -'}
                                        </p>
                                    </div>
                                    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${congregant.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {congregant.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>
                                <div className="mt-2 grid gap-1 rounded-lg bg-slate-50 p-2 text-[11px] font-semibold text-slate-600 sm:grid-cols-2">
                                    <p className="truncate">Kontak: {congregant.phone || congregant.email || '-'}</p>
                                    <p className="truncate">Lahir: {date(congregant.birth_date)}</p>
                                    <p className="truncate">Pekerjaan: {congregant.occupation || '-'}</p>
                                    <p className="truncate">Alamat: {congregant.address || '-'}</p>
                                </div>
                                <div className="mt-2 flex justify-end gap-2">
                                    <button className="rounded-lg bg-emerald-50 p-2 text-emerald-700" type="button" onClick={() => edit(congregant)}>
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button className="rounded-lg bg-rose-50 p-2 text-rose-600" type="button" onClick={() => destroy(congregant)}>
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </article>
                        ))}
                        {congregants.length === 0 && <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-center text-xs font-semibold text-slate-500">Belum ada data jamaah.</p>}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
