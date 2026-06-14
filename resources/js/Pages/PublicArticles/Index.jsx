import { router, useForm } from '@inertiajs/react';
import { Edit3, Image, Newspaper, Pin, Plus, Trash2, X } from 'lucide-react';
import { CheckboxInput, Field, PrimaryButton, SecondaryButton, SelectInput, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { date, label } from '../../lib/formatters';

const emptyForm = {
    title: '',
    slug: '',
    category: 'kegiatan',
    excerpt: '',
    body: '',
    cover_image: null,
    published_at: '',
    status: 'published',
    is_featured: false,
};

export default function Index({ articles }) {
    const { data, setData, post, processing, errors, reset, transform } = useForm(emptyForm);
    const editingId = data.id || null;
    const coverPreviewUrl = data.cover_image ? URL.createObjectURL(data.cover_image) : data.cover_image_path ? `/storage/${data.cover_image_path}` : null;

    const submit = (event) => {
        event.preventDefault();

        if (editingId) {
            transform((formData) => ({ ...formData, _method: 'put' }));
            post(`/artikel/${editingId}`, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => resetForm(),
                onFinish: () => transform((formData) => formData),
            });

            return;
        }

        transform((formData) => formData);
        post('/artikel', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => resetForm(),
        });
    };

    const edit = (article) => {
        setData({
            ...article,
            cover_image: null,
            published_at: article.published_at?.slice(0, 10) || '',
        });
    };

    const resetForm = () => {
        reset();
        setData(emptyForm);
    };

    const destroy = (article) => {
        if (window.confirm(`Hapus artikel "${article.title}"?`)) {
            router.delete(`/artikel/${article.id}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout title="Artikel Publik">
            <div className="grid min-w-0 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={submit} className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2.5">
                        <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                            <Newspaper className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">
                                {editingId ? 'Ubah Artikel' : 'Tambah Artikel'}
                            </p>
                            <h3 className="text-sm font-extrabold text-slate-950">Berita & Artikel Publik</h3>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        <TextInput label="Judul" value={data.title} onChange={(event) => setData('title', event.target.value)} error={errors.title} />
                        <TextInput label="Slug URL" value={data.slug || ''} onChange={(event) => setData('slug', event.target.value)} error={errors.slug} placeholder="Kosongkan untuk otomatis" />
                        <div className="grid gap-3 md:grid-cols-2">
                            <SelectInput label="Kategori" value={data.category || ''} onChange={(event) => setData('category', event.target.value)} error={errors.category}>
                                <option value="kegiatan">Kegiatan</option>
                                <option value="edukasi">Edukasi</option>
                                <option value="jamaah">Jamaah</option>
                                <option value="keuangan">Keuangan</option>
                                <option value="umum">Umum</option>
                            </SelectInput>
                            <SelectInput label="Status" value={data.status} onChange={(event) => setData('status', event.target.value)} error={errors.status}>
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Archived</option>
                            </SelectInput>
                            <TextInput label="Tanggal Publikasi" type="date" value={data.published_at || ''} onChange={(event) => setData('published_at', event.target.value)} error={errors.published_at} />
                            <Field label="Cover Image" error={errors.cover_image}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => setData('cover_image', event.target.files?.[0] || null)}
                                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-teal-700"
                                />
                            </Field>
                        </div>
                        {coverPreviewUrl && (
                            <img src={coverPreviewUrl} alt="Preview cover artikel" className="h-36 w-full rounded-xl border border-slate-100 object-cover" />
                        )}
                        <TextareaInput label="Ringkasan" rows={3} value={data.excerpt || ''} onChange={(event) => setData('excerpt', event.target.value)} error={errors.excerpt} />
                        <TextareaInput label="Isi Artikel" rows={9} value={data.body} onChange={(event) => setData('body', event.target.value)} error={errors.body} />
                        <CheckboxInput label="Tampilkan sebagai artikel unggulan" checked={Boolean(data.is_featured)} onChange={(value) => setData('is_featured', value)} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <PrimaryButton disabled={processing} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {editingId ? 'Simpan Artikel' : 'Tambah Artikel'}
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
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-950">Daftar Artikel</h3>
                    <div className="mt-3 space-y-2.5">
                        {articles.map((article) => (
                            <article key={article.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                                <div className="flex gap-3">
                                    <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-teal-50 text-teal-700">
                                        {article.cover_image_path ? (
                                            <img src={`/storage/${article.cover_image_path}`} alt={article.title} className="h-full w-full object-cover" />
                                        ) : (
                                            <Image className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="truncate text-xs font-extrabold text-slate-950">{article.title}</h4>
                                                    {article.is_featured && <Pin className="h-4 w-4 shrink-0 text-amber-500" />}
                                                </div>
                                                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-teal-700">
                                                    {label(article.category)} • {label(article.status)} • {date(article.published_at)}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 gap-2">
                                                <button className="text-emerald-700" type="button" onClick={() => edit(article)}>
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button className="text-rose-600" type="button" onClick={() => destroy(article)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-slate-600">{article.excerpt || article.body}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                        {articles.length === 0 && <p className="rounded-lg bg-teal-50 p-4 text-center text-xs font-semibold text-slate-500">Belum ada artikel.</p>}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
