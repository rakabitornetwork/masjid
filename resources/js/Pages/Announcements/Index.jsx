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
                <form onSubmit={submit} className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-emerald-950/5">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                            <Megaphone className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                                {editingId ? 'Ubah Pengumuman' : 'Tambah Pengumuman'}
                            </p>
                            <h3 className="text-lg font-black text-slate-950">Informasi Jamaah</h3>
                        </div>
                    </div>

                    <div className="grid gap-4">
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

                    <div className="mt-5 flex gap-2">
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

                <section className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-emerald-950/5">
                    <h3 className="text-lg font-black text-slate-950">Daftar Pengumuman</h3>
                    <div className="mt-4 space-y-3">
                        {announcements.map((announcement) => (
                            <article key={announcement.id} className="rounded-2xl border border-emerald-50 bg-white p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="font-black text-slate-950">{announcement.title}</h4>
                                            {announcement.is_pinned && <Pin className="h-4 w-4 text-amber-500" />}
                                        </div>
                                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
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
                                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{announcement.body}</p>
                            </article>
                        ))}
                        {announcements.length === 0 && <p className="rounded-2xl bg-emerald-50 p-5 text-center text-sm text-slate-500">Belum ada pengumuman.</p>}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
