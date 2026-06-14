import { router, useForm } from '@inertiajs/react';
import { Edit3, Heart, Plus, Trash2, UsersRound, WalletCards, X } from 'lucide-react';
import StatCard from '../../Components/StatCard';
import { CheckboxInput, PrimaryButton, SecondaryButton, SelectInput, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { date, label, money } from '../../lib/formatters';

const today = new Date().toISOString().slice(0, 10);

const emptyForm = {
    donor_name: '',
    donor_phone: '',
    category: 'sedekah_subuh',
    purpose: '',
    amount: '',
    payment_method: 'transfer',
    donated_at: today,
    status: 'confirmed',
    is_anonymous: false,
    notes: '',
};

const statusTone = {
    confirmed: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-slate-100 text-slate-600',
};

export default function Index({ donations, summary }) {
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);
    const editingId = data.id || null;

    const submit = (event) => {
        event.preventDefault();
        editingId
            ? put(`/sedekah-khusus/${editingId}`, { preserveScroll: true, onSuccess: resetForm })
            : post('/sedekah-khusus', { preserveScroll: true, onSuccess: resetForm });
    };

    const edit = (donation) => {
        setData({
            ...donation,
            donated_at: donation.donated_at?.slice(0, 10) || today,
            is_anonymous: Boolean(donation.is_anonymous),
        });
    };

    const resetForm = () => {
        reset();
        setData(emptyForm);
    };

    const destroy = (donation) => {
        if (window.confirm(`Hapus sedekah dari ${donation.is_anonymous ? 'Hamba Allah' : donation.donor_name || 'Hamba Allah'}?`)) {
            router.delete(`/sedekah-khusus/${donation.id}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout title="Sedekah Khusus">
            <section className="grid gap-4 md:grid-cols-4">
                <StatCard title="Total Terkumpul" value={money(summary.collected)} helper="Status confirmed" icon={Heart} />
                <StatCard title="Bulan Ini" value={money(summary.thisMonth)} helper="Sedekah confirmed" icon={WalletCards} tone="sky" />
                <StatCard title="Jumlah Donatur" value={summary.donors} helper="Catatan confirmed" icon={UsersRound} tone="emerald" />
                <StatCard title="Pending" value={summary.pending} helper="Menunggu konfirmasi" icon={Heart} tone="amber" />
            </section>

            <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[0.85fr_1.15fr]">
                <form onSubmit={submit} className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2.5">
                        <div className="rounded-lg bg-rose-100 p-2 text-rose-600">
                            <Heart className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">{editingId ? 'Ubah Sedekah' : 'Tambah Sedekah'}</p>
                            <h3 className="text-sm font-extrabold text-slate-950">Catatan Sedekah Khusus</h3>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <TextInput label="Nama Donatur" value={data.donor_name || ''} onChange={(event) => setData('donor_name', event.target.value)} error={errors.donor_name} />
                        <TextInput label="Nomor WA" value={data.donor_phone || ''} onChange={(event) => setData('donor_phone', event.target.value)} error={errors.donor_phone} />
                        <SelectInput label="Kategori" value={data.category} onChange={(event) => setData('category', event.target.value)} error={errors.category}>
                            <option value="sedekah_subuh">Sedekah Subuh</option>
                            <option value="sedekah_jumat">Sedekah Jumat</option>
                            <option value="yatim">Yatim/Piatu</option>
                            <option value="iftar">Iftar/Buka Puasa</option>
                            <option value="pendidikan">Pendidikan</option>
                            <option value="kesehatan">Kesehatan</option>
                            <option value="sosial">Sosial</option>
                            <option value="operasional">Operasional Masjid</option>
                            <option value="other">Lainnya</option>
                        </SelectInput>
                        <TextInput label="Nominal" type="number" value={data.amount || ''} onChange={(event) => setData('amount', event.target.value)} error={errors.amount} />
                        <SelectInput label="Metode" value={data.payment_method} onChange={(event) => setData('payment_method', event.target.value)} error={errors.payment_method}>
                            <option value="cash">Tunai</option>
                            <option value="transfer">Transfer</option>
                            <option value="qris">QRIS</option>
                            <option value="e_wallet">E-Wallet</option>
                        </SelectInput>
                        <TextInput label="Tanggal" type="date" value={data.donated_at} onChange={(event) => setData('donated_at', event.target.value)} error={errors.donated_at} />
                        <SelectInput label="Status" value={data.status} onChange={(event) => setData('status', event.target.value)} error={errors.status}>
                            <option value="confirmed">Confirmed</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                        </SelectInput>
                        <CheckboxInput label="Tampilkan sebagai Hamba Allah" checked={Boolean(data.is_anonymous)} onChange={(checked) => setData('is_anonymous', checked)} />
                        <div className="md:col-span-2">
                            <TextInput label="Tujuan Khusus" value={data.purpose || ''} onChange={(event) => setData('purpose', event.target.value)} error={errors.purpose} />
                        </div>
                        <div className="md:col-span-2">
                            <TextareaInput label="Catatan" value={data.notes || ''} onChange={(event) => setData('notes', event.target.value)} error={errors.notes} />
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <PrimaryButton disabled={processing} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {editingId ? 'Simpan Sedekah' : 'Tambah Sedekah'}
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
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-950">Riwayat Sedekah Khusus</h3>
                    <div className="mt-3 space-y-2">
                        {donations.map((donation) => (
                            <article key={donation.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-extrabold text-slate-900">{donation.is_anonymous ? 'Hamba Allah' : donation.donor_name || 'Hamba Allah'}</p>
                                        <p className="mt-0.5 truncate text-[11px] font-bold text-teal-700">
                                            {label(donation.category)} • {date(donation.donated_at)} • {label(donation.payment_method)}
                                        </p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="text-sm font-black text-emerald-600">{money(donation.amount)}</p>
                                        <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${statusTone[donation.status] || 'bg-slate-100 text-slate-600'}`}>{label(donation.status)}</span>
                                    </div>
                                </div>
                                <div className="mt-2 rounded-lg bg-slate-50 p-2 text-[11px] font-semibold text-slate-600">
                                    <p className="truncate">Tujuan: {donation.purpose || '-'}</p>
                                    <p className="truncate">WA: {donation.donor_phone || '-'}</p>
                                </div>
                                <div className="mt-2 flex justify-end gap-2">
                                    <button className="rounded-lg bg-emerald-50 p-2 text-emerald-700" type="button" onClick={() => edit(donation)}>
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button className="rounded-lg bg-rose-50 p-2 text-rose-600" type="button" onClick={() => destroy(donation)}>
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </article>
                        ))}
                        {donations.length === 0 && <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-center text-xs font-semibold text-slate-500">Belum ada catatan sedekah khusus.</p>}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
