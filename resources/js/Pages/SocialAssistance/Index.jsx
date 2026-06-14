import { router, useForm } from '@inertiajs/react';
import { CheckCircle2, Edit3, HandHeart, MessageCircle, Plus, Trash2, UsersRound, WalletCards, X } from 'lucide-react';
import StatCard from '../../Components/StatCard';
import { CheckboxInput, PrimaryButton, SecondaryButton, SelectInput, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { date, label, money } from '../../lib/formatters';

const emptyForm = {
    program_name: '',
    category: 'duafa',
    recipient_name: '',
    recipient_phone: '',
    recipient_address: '',
    amount: '',
    item_description: '',
    distributed_at: '',
    status: 'planned',
    notes: '',
    send_whatsapp: true,
};

const statusTone = {
    planned: 'bg-amber-100 text-amber-700',
    scheduled: 'bg-sky-100 text-sky-700',
    distributed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-slate-100 text-slate-600',
};

export default function Index({ programs, summary }) {
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);
    const editingId = data.id || null;

    const submit = (event) => {
        event.preventDefault();
        editingId
            ? put(`/program-sosial/${editingId}`, { preserveScroll: true, onSuccess: () => resetForm() })
            : post('/program-sosial', { preserveScroll: true, onSuccess: () => resetForm() });
    };

    const edit = (program) => {
        setData({
            ...program,
            distributed_at: program.distributed_at?.slice(0, 10) || '',
            send_whatsapp: false,
        });
    };

    const resetForm = () => {
        reset();
        setData(emptyForm);
    };

    const destroy = (program) => {
        if (window.confirm(`Hapus program sosial "${program.program_name}"?`)) {
            router.delete(`/program-sosial/${program.id}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout title="Program Sosial">
            <section className="grid gap-4 md:grid-cols-4">
                <StatCard title="Total Program" value={summary.total} helper="Semua bantuan sosial" icon={HandHeart} />
                <StatCard title="Rencana" value={summary.planned} helper="Belum disalurkan" icon={UsersRound} tone="amber" />
                <StatCard title="Tersalurkan" value={summary.distributed} helper="Bantuan selesai" icon={CheckCircle2} tone="emerald" />
                <StatCard title="Total Nominal" value={money(summary.amount)} helper="Nilai bantuan" icon={WalletCards} tone="sky" />
            </section>

            <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={submit} className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2.5">
                        <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                            <HandHeart className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">
                                {editingId ? 'Ubah Program' : 'Tambah Program'}
                            </p>
                            <h3 className="text-sm font-extrabold text-slate-950">Distribusi Bantuan Sosial</h3>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <TextInput label="Nama Program" value={data.program_name} onChange={(event) => setData('program_name', event.target.value)} error={errors.program_name} />
                        </div>
                        <SelectInput label="Kategori" value={data.category} onChange={(event) => setData('category', event.target.value)} error={errors.category}>
                            <option value="duafa">Dhuafa</option>
                            <option value="orphan">Yatim/Piatu</option>
                            <option value="education">Pendidikan</option>
                            <option value="health">Kesehatan</option>
                            <option value="disaster">Bencana</option>
                            <option value="ramadhan">Ramadhan</option>
                            <option value="other">Lainnya</option>
                        </SelectInput>
                        <SelectInput label="Status" value={data.status} onChange={(event) => setData('status', event.target.value)} error={errors.status}>
                            <option value="planned">Rencana</option>
                            <option value="scheduled">Terjadwal</option>
                            <option value="distributed">Tersalurkan</option>
                            <option value="cancelled">Dibatalkan</option>
                        </SelectInput>
                        <TextInput label="Nama Penerima" value={data.recipient_name} onChange={(event) => setData('recipient_name', event.target.value)} error={errors.recipient_name} />
                        <TextInput label="Nomor WA" value={data.recipient_phone || ''} onChange={(event) => setData('recipient_phone', event.target.value)} error={errors.recipient_phone} />
                        {!editingId && (
                            <div className="md:col-span-2 rounded-xl border border-teal-100 bg-teal-50/70 p-3">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                                            <MessageCircle className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">Konfirmasi WhatsApp</p>
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        <CheckboxInput label="Kirim WA" checked={Boolean(data.send_whatsapp)} onChange={(checked) => setData('send_whatsapp', checked)} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <TextInput label="Tanggal Distribusi" type="date" value={data.distributed_at || ''} onChange={(event) => setData('distributed_at', event.target.value)} error={errors.distributed_at} />
                        <TextInput label="Nominal Bantuan" type="number" value={data.amount || ''} onChange={(event) => setData('amount', event.target.value)} error={errors.amount} />
                        <div className="md:col-span-2">
                            <TextareaInput label="Alamat Penerima" value={data.recipient_address || ''} onChange={(event) => setData('recipient_address', event.target.value)} error={errors.recipient_address} />
                        </div>
                        <div className="md:col-span-2">
                            <TextareaInput label="Bantuan Barang / Paket" value={data.item_description || ''} onChange={(event) => setData('item_description', event.target.value)} error={errors.item_description} />
                        </div>
                        <div className="md:col-span-2">
                            <TextareaInput label="Catatan" value={data.notes || ''} onChange={(event) => setData('notes', event.target.value)} error={errors.notes} />
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <PrimaryButton disabled={processing} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {editingId ? 'Simpan Program' : 'Tambah Program'}
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
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-950">Daftar Program Sosial</h3>
                    <div className="mt-3 space-y-2">
                        {programs.map((program) => (
                            <article key={program.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-extrabold text-slate-900">{program.program_name}</p>
                                        <p className="mt-0.5 truncate text-[11px] font-bold text-teal-700">
                                            {label(program.category)} • {program.recipient_name} • {date(program.distributed_at)}
                                        </p>
                                    </div>
                                    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${statusTone[program.status] || 'bg-slate-100 text-slate-600'}`}>
                                        {label(program.status)}
                                    </span>
                                </div>
                                <div className="mt-2 grid gap-1 rounded-lg bg-slate-50 p-2 text-[11px] font-semibold text-slate-600 sm:grid-cols-2">
                                    <p className="truncate">Nominal: {money(program.amount)}</p>
                                    <p className="truncate">WA: {program.recipient_phone || '-'}</p>
                                    <p className="truncate sm:col-span-2">Barang: {program.item_description || '-'}</p>
                                </div>
                                <div className="mt-2 flex justify-end gap-2">
                                    <button className="rounded-lg bg-emerald-50 p-2 text-emerald-700" type="button" onClick={() => edit(program)}>
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button className="rounded-lg bg-rose-50 p-2 text-rose-600" type="button" onClick={() => destroy(program)}>
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </article>
                        ))}
                        {programs.length === 0 && <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-center text-xs font-semibold text-slate-500">Belum ada program sosial.</p>}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
