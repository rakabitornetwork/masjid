import { router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Camera, Edit3, GripVertical, Plus, Trash2, UserRound, UsersRound, X } from 'lucide-react';
import { CheckboxInput, PrimaryButton, SecondaryButton, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { date } from '../../lib/formatters';

const emptyForm = {
    name: '',
    position: '',
    phone: '',
    email: '',
    avatar: null,
    period_start: '',
    period_end: '',
    sort_order: 0,
    is_active: true,
    notes: '',
};

export default function Index({ members }) {
    const { data, setData, post, processing, errors, reset, transform } = useForm(emptyForm);
    const [orderedMembers, setOrderedMembers] = useState(members);
    const [draggedMemberId, setDraggedMemberId] = useState(null);
    const [dragOverMemberId, setDragOverMemberId] = useState(null);
    const editingId = data.id || null;
    const avatarPreviewUrl = data.avatar ? URL.createObjectURL(data.avatar) : data.avatar_path ? `/storage/${data.avatar_path}` : null;

    useEffect(() => {
        setOrderedMembers(members);
    }, [members]);

    const submit = (event) => {
        event.preventDefault();

        if (editingId) {
            transform((formData) => ({ ...formData, _method: 'put' }));
            post(`/pengurus/${editingId}`, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => resetForm(),
                onFinish: () => transform((formData) => formData),
            });

            return;
        }

        transform((formData) => formData);
        post('/pengurus', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => resetForm(),
        });
    };

    const edit = (member) => {
        setData({
            ...member,
            avatar: null,
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

    const moveMember = (sourceId, targetId) => {
        if (!sourceId || !targetId || sourceId === targetId) {
            return orderedMembers;
        }

        const nextMembers = [...orderedMembers];
        const sourceIndex = nextMembers.findIndex((member) => member.id === sourceId);
        const targetIndex = nextMembers.findIndex((member) => member.id === targetId);

        if (sourceIndex === -1 || targetIndex === -1) {
            return orderedMembers;
        }

        const [draggedMember] = nextMembers.splice(sourceIndex, 1);
        nextMembers.splice(targetIndex, 0, draggedMember);

        return nextMembers.map((member, index) => ({
            ...member,
            sort_order: index + 1,
        }));
    };

    const persistOrder = (nextMembers) => {
        router.post(
            '/pengurus/urutkan',
            {
                members: nextMembers.map((member, index) => ({
                    id: member.id,
                    sort_order: index + 1,
                })),
            },
            {
                preserveScroll: true,
                onError: () => setOrderedMembers(members),
            },
        );
    };

    const handleDragStart = (event, member) => {
        setDraggedMemberId(member.id);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(member.id));
    };

    const handleDragOver = (event, member) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setDragOverMemberId(member.id);
    };

    const handleDrop = (event, targetMember) => {
        event.preventDefault();

        const sourceId = Number(event.dataTransfer.getData('text/plain') || draggedMemberId);
        const nextMembers = moveMember(sourceId, targetMember.id);

        setDraggedMemberId(null);
        setDragOverMemberId(null);

        if (nextMembers === orderedMembers) {
            return;
        }

        setOrderedMembers(nextMembers);
        persistOrder(nextMembers);
    };

    const handleDragEnd = () => {
        setDraggedMemberId(null);
        setDragOverMemberId(null);
    };

    return (
        <AppLayout title="Pengurus Masjid">
            <div className="grid min-w-0 gap-4 xl:grid-cols-[0.85fr_1.15fr]">
                <form onSubmit={submit} className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
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
                        <div className="md:col-span-2 rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">Foto Pengurus</p>
                            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white bg-white text-teal-600 shadow-sm">
                                    {avatarPreviewUrl ? (
                                        <img src={avatarPreviewUrl} alt="Foto pengurus" className="h-full w-full object-cover" />
                                    ) : (
                                        <UserRound className="h-9 w-9" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-teal-700">
                                        <Camera className="h-4 w-4" />
                                        Pilih Foto
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(event) => setData('avatar', event.target.files?.[0] || null)}
                                        />
                                    </label>
                                    {errors.avatar && <p className="mt-2 text-[10px] font-semibold text-rose-600">{errors.avatar}</p>}
                                    <p className="mt-2 text-[10px] font-semibold leading-5 text-slate-500">
                                        Gunakan gambar JPG/PNG maksimal 2MB agar foto tampil jelas di daftar pengurus.
                                    </p>
                                </div>
                            </div>
                        </div>
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

                    <div className="mt-4 flex flex-wrap gap-2">
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

                <section className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-950">Daftar Pengurus</h3>
                        <p className="text-[11px] font-semibold text-slate-500">Tarik baris untuk mengatur urutan.</p>
                    </div>
                    <div className="mt-3 space-y-2 md:hidden">
                        {orderedMembers.map((member) => (
                            <div
                                key={member.id}
                                draggable={orderedMembers.length > 1}
                                onDragStart={(event) => handleDragStart(event, member)}
                                onDragOver={(event) => handleDragOver(event, member)}
                                onDrop={(event) => handleDrop(event, member)}
                                onDragEnd={handleDragEnd}
                                className={`rounded-xl border p-3 transition ${
                                    draggedMemberId === member.id
                                        ? 'border-amber-200 bg-amber-50 opacity-70'
                                        : dragOverMemberId === member.id
                                          ? 'border-emerald-200 bg-emerald-50'
                                          : 'border-slate-100 bg-white'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <span
                                        className="mt-1 inline-flex cursor-grab items-center rounded-lg border border-emerald-100 bg-emerald-50 p-1 text-emerald-700 active:cursor-grabbing"
                                        title="Geser urutan"
                                    >
                                        <GripVertical className="h-4 w-4" />
                                    </span>
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 shadow-sm">
                                        {member.avatar_path ? (
                                            <img src={`/storage/${member.avatar_path}`} alt={member.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <UserRound className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-extrabold text-slate-900">{member.name}</p>
                                                <p className="truncate text-xs font-bold text-teal-700">{member.position}</p>
                                            </div>
                                            <span
                                                className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${
                                                    member.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                                }`}
                                            >
                                                {member.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-[11px] font-semibold text-slate-500">
                                            {date(member.period_start)} - {date(member.period_end)}
                                        </p>
                                        <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-400">{member.email || member.phone || 'Kontak belum diisi'}</p>
                                        <div className="mt-2 flex justify-end gap-2">
                                            <button className="rounded-lg bg-emerald-50 p-2 text-emerald-700" type="button" onClick={() => edit(member)}>
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                            <button className="rounded-lg bg-rose-50 p-2 text-rose-600" type="button" onClick={() => destroy(member)}>
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {orderedMembers.length === 0 && <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-center text-xs font-semibold text-slate-500">Belum ada data pengurus.</p>}
                    </div>
                    <div className="mt-3 hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[860px] text-left text-xs">
                            <thead className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                                <tr>
                                    <th className="w-10 py-3">Urut</th>
                                    <th className="py-3">Nama</th>
                                    <th>Jabatan</th>
                                    <th>Periode</th>
                                    <th>Status</th>
                                    <th className="text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-50">
                                {orderedMembers.map((member) => (
                                    <tr
                                        key={member.id}
                                        draggable={orderedMembers.length > 1}
                                        onDragStart={(event) => handleDragStart(event, member)}
                                        onDragOver={(event) => handleDragOver(event, member)}
                                        onDrop={(event) => handleDrop(event, member)}
                                        onDragEnd={handleDragEnd}
                                        className={`transition ${
                                            draggedMemberId === member.id
                                                ? 'bg-amber-50 opacity-60'
                                                : dragOverMemberId === member.id
                                                  ? 'bg-emerald-50'
                                                  : 'bg-white'
                                        }`}
                                    >
                                        <td className="py-2.5">
                                            <span
                                                className="inline-flex cursor-grab items-center rounded-lg border border-emerald-100 bg-emerald-50 p-1 text-emerald-700 active:cursor-grabbing"
                                                title="Geser urutan"
                                            >
                                                <GripVertical className="h-4 w-4" />
                                            </span>
                                        </td>
                                        <td className="py-2.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 shadow-sm">
                                                    {member.avatar_path ? (
                                                        <img src={`/storage/${member.avatar_path}`} alt={member.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <UserRound className="h-5 w-5" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate font-bold text-slate-900">{member.name}</p>
                                                    <p className="truncate text-[10px] font-semibold text-slate-400">{member.email || member.phone || 'Kontak belum diisi'}</p>
                                                </div>
                                            </div>
                                        </td>
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
                                {orderedMembers.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-slate-500">
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
