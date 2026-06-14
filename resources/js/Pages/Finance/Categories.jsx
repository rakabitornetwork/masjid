import { router, useForm } from '@inertiajs/react';
import { Edit3, Landmark, Plus, Trash2, X } from 'lucide-react';
import { CheckboxInput, PrimaryButton, SecondaryButton, SelectInput, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { label } from '../../lib/formatters';

const emptyForm = {
    name: '',
    type: 'income',
    color: 'emerald',
    icon: '',
    description: '',
    is_active: true,
};

export default function Categories({ categories }) {
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);
    const editingId = data.id || null;

    const submit = (event) => {
        event.preventDefault();
        editingId
            ? put(`/keuangan/kategori/${editingId}`, { onSuccess: () => resetForm() })
            : post('/keuangan/kategori', { onSuccess: () => resetForm() });
    };

    const resetForm = () => {
        reset();
        setData(emptyForm);
    };

    const destroy = (category) => {
        if (window.confirm(`Hapus kategori "${category.name}"?`)) {
            router.delete(`/keuangan/kategori/${category.id}`);
        }
    };

    return (
        <AppLayout title="Kategori Keuangan">
            <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
                <form onSubmit={submit} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2.5">
                        <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
                            <Landmark className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">{editingId ? 'Ubah Kategori' : 'Tambah Kategori'}</p>
                            <h3 className="text-sm font-extrabold text-slate-950">Klasifikasi Transaksi</h3>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <TextInput label="Nama Kategori" value={data.name} onChange={(event) => setData('name', event.target.value)} error={errors.name} />
                        <SelectInput label="Jenis" value={data.type} onChange={(event) => setData('type', event.target.value)} error={errors.type}>
                            <option value="income">Pemasukan</option>
                            <option value="expense">Pengeluaran</option>
                        </SelectInput>
                        <SelectInput label="Warna" value={data.color} onChange={(event) => setData('color', event.target.value)} error={errors.color}>
                            <option value="emerald">Emerald</option>
                            <option value="amber">Amber</option>
                            <option value="sky">Sky</option>
                            <option value="rose">Rose</option>
                            <option value="slate">Slate</option>
                        </SelectInput>
                        <TextInput label="Nama Icon" value={data.icon || ''} onChange={(event) => setData('icon', event.target.value)} error={errors.icon} />
                        <div className="md:col-span-2">
                            <TextareaInput
                                label="Deskripsi"
                                value={data.description || ''}
                                onChange={(event) => setData('description', event.target.value)}
                                error={errors.description}
                            />
                        </div>
                        <CheckboxInput label="Aktif" checked={Boolean(data.is_active)} onChange={(value) => setData('is_active', value)} />
                    </div>

                    <div className="mt-4 flex gap-2">
                        <PrimaryButton disabled={processing} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {editingId ? 'Simpan Perubahan' : 'Tambah Kategori'}
                        </PrimaryButton>
                        {editingId && (
                            <SecondaryButton type="button" onClick={resetForm} className="gap-2">
                                <X className="h-4 w-4" />
                                Batal
                            </SecondaryButton>
                        )}
                    </div>
                </form>

                <section className="rounded-2xl border border-white/75 bg-white/95 p-4 shadow-lg shadow-blue-950/5 ring-1 ring-slate-100/80">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-teal-700">Keuangan</p>
                            <h3 className="mt-0.5 text-sm font-extrabold text-slate-950">Daftar Kategori</h3>
                        </div>
                        <div className="rounded-xl bg-amber-100 p-2 text-amber-700 ring-1 ring-amber-200/70">
                            <Landmark className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {categories.map((category) => (
                            <article
                                key={category.id}
                                className={`group relative overflow-hidden rounded-2xl border bg-white p-3.5 shadow-sm ring-1 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                                    category.type === 'income'
                                        ? 'border-emerald-100 ring-emerald-50 hover:shadow-emerald-900/10'
                                        : 'border-rose-100 ring-rose-50 hover:shadow-rose-900/10'
                                }`}
                            >
                                <div className={`pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full blur-2xl ${category.type === 'income' ? 'bg-emerald-200/65' : 'bg-rose-200/60'}`} />
                                <div className="relative flex items-start justify-between gap-2.5">
                                    <div className="min-w-0">
                                        <p className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] ${category.type === 'income' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'}`}>
                                            {label(category.type)}
                                        </p>
                                        <h4 className="mt-2 truncate text-sm font-extrabold text-slate-950">{category.name}</h4>
                                        <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-5 text-slate-500">{category.description || 'Tanpa deskripsi'}</p>
                                    </div>
                                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm ${category.is_active ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/70' : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200/70'}`}>
                                        {category.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>
                                <div className="relative mt-3 flex gap-2">
                                    <SecondaryButton type="button" onClick={() => setData({ ...category })} className="gap-2 text-emerald-700">
                                        <Edit3 className="h-4 w-4" />
                                        Edit
                                    </SecondaryButton>
                                    <SecondaryButton type="button" onClick={() => destroy(category)} className="gap-2 text-rose-600">
                                        <Trash2 className="h-4 w-4" />
                                        Hapus
                                    </SecondaryButton>
                                </div>
                            </article>
                        ))}
                        {categories.length === 0 && <p className="rounded-lg bg-teal-50 p-4 text-center text-xs font-semibold text-slate-500 md:col-span-2">Belum ada kategori.</p>}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
