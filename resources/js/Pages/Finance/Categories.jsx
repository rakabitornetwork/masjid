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
                <form onSubmit={submit} className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-emerald-950/5">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                            <Landmark className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">{editingId ? 'Ubah Kategori' : 'Tambah Kategori'}</p>
                            <h3 className="text-lg font-black text-slate-950">Klasifikasi Transaksi</h3>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
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

                    <div className="mt-5 flex gap-2">
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

                <section className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-emerald-950/5">
                    <h3 className="text-lg font-black text-slate-950">Daftar Kategori</h3>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {categories.map((category) => (
                            <article key={category.id} className="rounded-2xl border border-emerald-50 bg-white p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label(category.type)}</p>
                                        <h4 className="mt-1 font-black text-slate-950">{category.name}</h4>
                                        <p className="mt-1 text-sm text-slate-500">{category.description || 'Tanpa deskripsi'}</p>
                                    </div>
                                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${category.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {category.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <SecondaryButton type="button" onClick={() => setData({ ...category })} className="gap-2">
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
                        {categories.length === 0 && <p className="rounded-2xl bg-emerald-50 p-5 text-center text-sm text-slate-500 md:col-span-2">Belum ada kategori.</p>}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
