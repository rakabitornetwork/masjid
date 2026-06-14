import { router, useForm } from '@inertiajs/react';
import { Edit3, Megaphone, Pin, Plus, Trash2, X } from 'lucide-react';
import { CheckboxInput, PrimaryButton, SecondaryButton, SelectInput, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { date, label } from '../../lib/formatters';

const emptyForm = {
    title: '',
    category: 'umum',
    body: '',
    published_at: '',
    expires_at: '',
    is_pinned: false,
    status: 'published',
};

export default function Index({ announcements }) {
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);
    const editingId = data.id || null;

    const submit = (event) => {
        event.preventDefault();
        editingId
            ? put(`/pengumuman/${editingId}`, { onSuccess: () => resetForm() })
            : post('/pengumuman', { onSuccess: () => resetForm() });
    };

    const edit = (announcement) => {
        setData({
            ...announcement,
            published_at: announcement.published_at?.slice(0, 10) || '',
            expires_at: announcement.expires_at?.slice(0, 10) || '',
        });
    };

    const resetForm = () => {
        reset();
        setData(emptyForm);
    };

    const destroy = (announcement) => {
        if (window.confirm(`Hapus pengumuman "${announcement.title}"?`)) {
            router.delete(`/pengumuman/${announcement.id}`);
        }
    };

    return (
        <AppLayout title="Pengumuman">
            <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
                <form onSubmit={submit} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2.5">
                        <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
                            <Megaphone className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">
                                {editingId ? 'Ubah Pengumuman' : 'Tambah Pengumuman'}
                            </p>
                            <h3 className="text-sm font-extrabold text-slate-950">Informasi Jamaah</h3>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        <TextInput label="Judul" value={data.title} onChange={(event) => setData('title', event.target.value)} error={errors.title} />
                        <div className="grid gap-4 md:grid-cols-2">
                            <SelectInput label="Kategori" value={data.category} onChange={(event) => setData('category', event.target.value)} error={errors.category}>
                                <option value="umum">Umum</option>
                                <option value="urgent">Penting</option>
                                <option value="keuangan">Keuangan</option>
                                <option value="kegiatan">Kegiatan</option>
                            </SelectInput>
                            <SelectInput label="Status" value={data.status} onChange={(event) => setData('status', event.target.value)} error={errors.status}>
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Archived</option>
                            </SelectInput>
                            <TextInput
                                label="Tanggal Publikasi"
                                type="date"
                                value={data.published_at || ''}
                                onChange={(event) => setData('published_at', event.target.value)}
                                error={errors.published_at}
                            />
                            <TextInput
                                label="Tanggal Kedaluwarsa"
                                type="date"
                                value={data.expires_at || ''}
                                onChange={(event) => setData('expires_at', event.target.value)}
                                error={errors.expires_at}
                            />
                        </div>
                        <TextareaInput label="Isi Pengumuman" rows={6} value={data.body} onChange={(event) => setData('body', event.target.value)} error={errors.body} />
                        <CheckboxInput label="Pin di dashboard" checked={Boolean(data.is_pinned)} onChange={(value) => setData('is_pinned', value)} />
                    </div>

                    <div className="mt-4 flex gap-2">
                        <PrimaryButton disabled={processing} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {editingId ? 'Simpan Perubahan' : 'Tambah Pengumuman'}
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
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-950">Daftar Pengumuman</h3>
                    <div className="mt-3 space-y-2.5">
                        {announcements.map((announcement) => (
                            <article key={announcement.id} className="rounded-lg border border-slate-100 bg-white p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                        <h4 className="text-xs font-extrabold text-slate-950">{announcement.title}</h4>
                                            {announcement.is_pinned && <Pin className="h-4 w-4 text-amber-500" />}
                                        </div>
                                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                            {label(announcement.category)} • {label(announcement.status)} • {date(announcement.published_at)}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="text-emerald-700" type="button" onClick={() => edit(announcement)}>
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                        <button className="text-rose-600" type="button" onClick={() => destroy(announcement)}>
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <p className="mt-2 line-clamp-3 text-xs font-medium leading-5 text-slate-600">{announcement.body}</p>
                            </article>
                        ))}
                        {announcements.length === 0 && <p className="rounded-lg bg-teal-50 p-4 text-center text-xs font-semibold text-slate-500">Belum ada pengumuman.</p>}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
