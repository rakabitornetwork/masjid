import { router, useForm } from '@inertiajs/react';
import { Edit3, Plus, Trash2, UsersRound, X } from 'lucide-react';
import { CheckboxInput, PrimaryButton, SecondaryButton, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { date } from '../../lib/formatters';

const emptyForm = {
    name: '',
    position: '',
    phone: '',
    email: '',
    period_start: '',
    period_end: '',
    sort_order: 0,
    is_active: true,
    notes: '',
};

export default function Index({ members }) {
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);
    const editingId = data.id || null;

    const submit = (event) => {
        event.preventDefault();
        editingId ? put(`/pengurus/${editingId}`, { onSuccess: () => resetForm() }) : post('/pengurus', { onSuccess: () => resetForm() });
    };

    const edit = (member) => {
        setData({
            ...member,
            period_start: member.period_start?.slice(0, 10) || '',
            period_end: member.period_end?.slice(0, 10) || '',
        });
    };

    const resetForm = () => {
        reset();
        setData(emptyForm);
    };

    const destroy = (member) => {
        if (window.confirm(`Hapus pengurus ${member.name}?`)) {
            router.delete(`/pengurus/${member.id}`);
        }
    };

    return (
        <AppLayout title="Pengurus Masjid">
            <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
                <form onSubmit={submit} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2.5">
                        <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                            <UsersRound className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">
                                {editingId ? 'Ubah Data' : 'Tambah Data'}
                            </p>
                            <h3 className="text-sm font-extrabold text-slate-950">Pengurus / Takmir</h3>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <TextInput label="Nama" value={data.name} onChange={(event) => setData('name', event.target.value)} error={errors.name} />
                        <TextInput
                            label="Jabatan"
                            value={data.position}
                            onChange={(event) => setData('position', event.target.value)}
                            error={errors.position}
                        />
                        <TextInput label="Telepon" value={data.phone || ''} onChange={(event) => setData('phone', event.target.value)} error={errors.phone} />
                        <TextInput label="Email" value={data.email || ''} onChange={(event) => setData('email', event.target.value)} error={errors.email} />
                        <TextInput
                            label="Mulai Periode"
                            type="date"
                            value={data.period_start || ''}
                            onChange={(event) => setData('period_start', event.target.value)}
                            error={errors.period_start}
                        />
                        <TextInput
                            label="Akhir Periode"
                            type="date"
                            value={data.period_end || ''}
                            onChange={(event) => setData('period_end', event.target.value)}
                            error={errors.period_end}
                        />
                        <TextInput
                            label="Urutan"
                            type="number"
                            value={data.sort_order || 0}
                            onChange={(event) => setData('sort_order', event.target.value)}
                            error={errors.sort_order}
                        />
                        <CheckboxInput label="Aktif" checked={Boolean(data.is_active)} onChange={(value) => setData('is_active', value)} />
                        <div className="md:col-span-2">
                            <TextareaInput label="Catatan" value={data.notes || ''} onChange={(event) => setData('notes', event.target.value)} error={errors.notes} />
                        </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                        <PrimaryButton disabled={processing} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {editingId ? 'Simpan Perubahan' : 'Tambah Pengurus'}
                        </PrimaryButton>
                        {editingId && (
                            <SecondaryButton type="button" onClick={resetForm} className="gap-2">
                                <X className="h-4 w-4" />
                                Batal
                            </SecondaryButton>
                        )}
                    </div>
                </form>

                <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-950">Daftar Pengurus</h3>
                    <div className="mt-3 overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-xs">
                            <thead className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                                <tr>
                                    <th className="py-3">Nama</th>
                                    <th>Jabatan</th>
                                    <th>Periode</th>
                                    <th>Status</th>
                                    <th className="text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-50">
                                {members.map((member) => (
                                    <tr key={member.id}>
                                        <td className="py-2.5 font-bold text-slate-900">{member.name}</td>
                                        <td>{member.position}</td>
                                        <td className="text-slate-500">
                                            {date(member.period_start)} - {date(member.period_end)}
                                        </td>
                                        <td>
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs font-bold ${
                                                    member.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                                }`}
                                            >
                                                {member.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <button className="mr-2 text-emerald-700" type="button" onClick={() => edit(member)}>
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                            <button className="text-rose-600" type="button" onClick={() => destroy(member)}>
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {members.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-slate-500">
                                            Belum ada data pengurus.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
