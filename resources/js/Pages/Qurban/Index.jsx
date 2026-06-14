import { router, useForm } from '@inertiajs/react';
import { Beef, Edit3, MessageCircle, Plus, Trash2, X } from 'lucide-react';
import StatCard from '../../Components/StatCard';
import { CheckboxInput, PrimaryButton, SecondaryButton, SelectInput, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { date, label, money } from '../../lib/formatters';

const today = new Date().toISOString().slice(0, 10);

const emptyForm = {
    participant_name: '',
    phone: '',
    animal_type: 'goat',
    share_count: 1,
    group_name: '',
    amount_paid: '',
    target_amount: '',
    payment_status: 'unpaid',
    slaughter_status: 'registered',
    registered_at: today,
    slaughtered_at: '',
    distribution_notes: '',
    notes: '',
    send_whatsapp: true,
};

export default function Index({ participants, summary }) {
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);
    const editingId = data.id || null;

    const submit = (event) => {
        event.preventDefault();
        editingId ? put(`/qurban/${editingId}`, { onSuccess: () => resetForm() }) : post('/qurban', { onSuccess: () => resetForm() });
    };

    const edit = (participant) => {
        setData({
            ...participant,
            registered_at: participant.registered_at?.slice(0, 10) || today,
            slaughtered_at: participant.slaughtered_at?.slice(0, 10) || '',
            send_whatsapp: false,
        });
    };

    const resetForm = () => {
        reset();
        setData(emptyForm);
    };

    const destroy = (participant) => {
        if (window.confirm(`Hapus data qurban ${participant.participant_name}?`)) {
            router.delete(`/qurban/${participant.id}`);
        }
    };

    return (
        <AppLayout title="Manajemen Qurban">
            <section className="grid gap-4 md:grid-cols-4">
                <StatCard title="Pekurban" value={summary.total} helper="Total peserta" icon={Beef} />
                <StatCard title="Kambing" value={summary.goat} helper="Hewan individual" icon={Beef} tone="sky" />
                <StatCard title="Saham Sapi" value={summary.cowShares} helper="Maksimal 7 per sapi" icon={Beef} tone="amber" />
                <StatCard title="Dana Masuk" value={money(summary.paid)} helper="Total pembayaran" icon={Beef} tone="emerald" />
            </section>

            <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[0.85fr_1.15fr]">
                <form onSubmit={submit} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">{editingId ? 'Ubah Data Qurban' : 'Tambah Data Qurban'}</p>
                    <h3 className="text-sm font-extrabold text-slate-950">Pekurban dan Hewan</h3>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <TextInput label="Nama Pekurban" value={data.participant_name} onChange={(event) => setData('participant_name', event.target.value)} error={errors.participant_name} />
                        <TextInput label="Telepon" value={data.phone || ''} onChange={(event) => setData('phone', event.target.value)} error={errors.phone} />
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
                        <SelectInput label="Jenis Hewan" value={data.animal_type} onChange={(event) => setData('animal_type', event.target.value)} error={errors.animal_type}>
                            <option value="goat">Kambing</option>
                            <option value="cow">Sapi</option>
                        </SelectInput>
                        <TextInput label="Jumlah Saham" type="number" value={data.share_count} onChange={(event) => setData('share_count', event.target.value)} error={errors.share_count} />
                        <TextInput label="Kelompok / Sapi" value={data.group_name || ''} onChange={(event) => setData('group_name', event.target.value)} error={errors.group_name} />
                        <TextInput label="Target Biaya" type="number" value={data.target_amount || ''} onChange={(event) => setData('target_amount', event.target.value)} error={errors.target_amount} />
                        <TextInput label="Sudah Dibayar" type="number" value={data.amount_paid || ''} onChange={(event) => setData('amount_paid', event.target.value)} error={errors.amount_paid} />
                        <SelectInput label="Status Bayar" value={data.payment_status} onChange={(event) => setData('payment_status', event.target.value)} error={errors.payment_status}>
                            <option value="unpaid">Belum Bayar</option>
                            <option value="partial">Sebagian</option>
                            <option value="paid">Lunas</option>
                        </SelectInput>
                        <SelectInput label="Status Qurban" value={data.slaughter_status} onChange={(event) => setData('slaughter_status', event.target.value)} error={errors.slaughter_status}>
                            <option value="registered">Terdaftar</option>
                            <option value="ready">Siap Disembelih</option>
                            <option value="slaughtered">Disembelih</option>
                            <option value="distributed">Dibagikan</option>
                        </SelectInput>
                        <TextInput label="Tanggal Daftar" type="date" value={data.registered_at} onChange={(event) => setData('registered_at', event.target.value)} error={errors.registered_at} />
                        <TextInput label="Tanggal Sembelih" type="date" value={data.slaughtered_at || ''} onChange={(event) => setData('slaughtered_at', event.target.value)} error={errors.slaughtered_at} />
                        <div className="md:col-span-2">
                            <TextareaInput label="Catatan Distribusi" value={data.distribution_notes || ''} onChange={(event) => setData('distribution_notes', event.target.value)} error={errors.distribution_notes} />
                        </div>
                        <div className="md:col-span-2">
                            <TextareaInput label="Catatan" value={data.notes || ''} onChange={(event) => setData('notes', event.target.value)} error={errors.notes} />
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <PrimaryButton disabled={processing} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {editingId ? 'Simpan Perubahan' : 'Tambah Qurban'}
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
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-950">Daftar Pekurban</h3>
                    <div className="mt-3 space-y-2">
                        {participants.map((participant) => (
                            <article key={participant.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-extrabold text-slate-900">{participant.participant_name}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-700">
                                            {label(participant.animal_type)} • {participant.share_count} saham • {label(participant.slaughter_status)}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        <button className="rounded-lg bg-emerald-50 p-2 text-emerald-700" type="button" onClick={() => edit(participant)}>
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                        <button className="rounded-lg bg-rose-50 p-2 text-rose-600" type="button" onClick={() => destroy(participant)}>
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${participant.payment_progress}%` }} />
                                </div>
                                <div className="mt-2 grid gap-1 rounded-lg bg-slate-50 p-2 text-[11px] font-semibold text-slate-600 sm:grid-cols-2">
                                    <p className="truncate">Bayar: {money(participant.amount_paid)} / {money(participant.target_amount)}</p>
                                    <p className="truncate">Status: {label(participant.payment_status)}</p>
                                    <p className="truncate">Daftar: {date(participant.registered_at)}</p>
                                    <p className="truncate">Sembelih: {date(participant.slaughtered_at)}</p>
                                </div>
                            </article>
                        ))}
                        {participants.length === 0 && <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-center text-xs font-semibold text-slate-500">Belum ada data qurban.</p>}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
