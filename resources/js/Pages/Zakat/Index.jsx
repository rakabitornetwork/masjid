import { router, useForm } from '@inertiajs/react';
import { HandCoins, MessageCircle, Plus, Trash2, UsersRound } from 'lucide-react';
import StatCard from '../../Components/StatCard';
import { CheckboxInput, PrimaryButton, SelectInput, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { date, label, money } from '../../lib/formatters';

const today = new Date().toISOString().slice(0, 10);

export default function Index({ collections, distributions, muzakkiOptions = [], mustahikOptions = [], summary }) {
    const collectionForm = useForm({
        zakat_participant_id: '',
        muzakki_name: '',
        muzakki_phone: '',
        type: 'fitrah',
        money_amount: '',
        rice_amount: '',
        payment_method: 'cash',
        received_at: today,
        status: 'received',
        notes: '',
        send_whatsapp: true,
    });
    const distributionForm = useForm({
        zakat_participant_id: '',
        mustahik_name: '',
        mustahik_category: 'fakir_miskin',
        phone: '',
        address: '',
        money_amount: '',
        rice_amount: '',
        distributed_at: today,
        status: 'distributed',
        notes: '',
        send_whatsapp: true,
    });

    const submitCollection = (event) => {
        event.preventDefault();
        collectionForm.post('/zakat/penerimaan', {
            onSuccess: () => collectionForm.reset(),
        });
    };

    const selectMuzakki = (participantId) => {
        const participant = muzakkiOptions.find((item) => String(item.id) === String(participantId));

        collectionForm.setData({
            ...collectionForm.data,
            zakat_participant_id: participantId,
            muzakki_name: participant?.name || collectionForm.data.muzakki_name,
            muzakki_phone: participant?.phone || collectionForm.data.muzakki_phone,
        });
    };

    const selectMustahik = (participantId) => {
        const participant = mustahikOptions.find((item) => String(item.id) === String(participantId));

        distributionForm.setData({
            ...distributionForm.data,
            zakat_participant_id: participantId,
            mustahik_name: participant?.name || distributionForm.data.mustahik_name,
            mustahik_category: participant?.mustahik_category || distributionForm.data.mustahik_category,
            phone: participant?.phone || distributionForm.data.phone,
            address: participant?.address || distributionForm.data.address,
        });
    };

    const submitDistribution = (event) => {
        event.preventDefault();
        distributionForm.post('/zakat/penyaluran', {
            onSuccess: () => distributionForm.reset(),
        });
    };

    const deleteCollection = (item) => {
        if (window.confirm(`Hapus penerimaan zakat dari ${item.muzakki_name}?`)) {
            router.delete(`/zakat/penerimaan/${item.id}`);
        }
    };

    const deleteDistribution = (item) => {
        if (window.confirm(`Hapus penyaluran zakat untuk ${item.mustahik_name}?`)) {
            router.delete(`/zakat/penyaluran/${item.id}`);
        }
    };

    return (
        <AppLayout title="Manajemen Zakat">
            <section className="grid gap-4 md:grid-cols-3">
                <StatCard title="Saldo Dana Zakat" value={money(summary.balance_money)} helper="Penerimaan - penyaluran" icon={HandCoins} />
                <StatCard title="Saldo Beras" value={`${Number(summary.balance_rice || 0)} kg`} helper="Zakat fitrah beras" icon={HandCoins} tone="amber" />
                <StatCard title="Total Mustahik" value={distributions.length} helper="Riwayat penyaluran" icon={UsersRound} tone="sky" />
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-2">
                <form onSubmit={submitCollection} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">Penerimaan Zakat</p>
                    <h3 className="text-sm font-extrabold text-slate-950">Catat Muzakki</h3>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <SelectInput label="Pilih Database Muzakki" value={collectionForm.data.zakat_participant_id || ''} onChange={(event) => selectMuzakki(event.target.value)} error={collectionForm.errors.zakat_participant_id}>
                                <option value="">Input manual / belum terhubung</option>
                                {muzakkiOptions.map((participant) => (
                                    <option key={participant.id} value={participant.id}>
                                        {participant.name} {participant.phone ? `- ${participant.phone}` : ''}
                                    </option>
                                ))}
                            </SelectInput>
                        </div>
                        <TextInput label="Nama Muzakki" value={collectionForm.data.muzakki_name} onChange={(event) => collectionForm.setData('muzakki_name', event.target.value)} error={collectionForm.errors.muzakki_name} />
                        <TextInput label="Telepon" value={collectionForm.data.muzakki_phone || ''} onChange={(event) => collectionForm.setData('muzakki_phone', event.target.value)} error={collectionForm.errors.muzakki_phone} />
                        <WhatsappConfirmationCard
                            checked={Boolean(collectionForm.data.send_whatsapp)}
                            onChange={(checked) => collectionForm.setData('send_whatsapp', checked)}
                        />
                        <SelectInput label="Jenis Zakat" value={collectionForm.data.type} onChange={(event) => collectionForm.setData('type', event.target.value)} error={collectionForm.errors.type}>
                            <option value="fitrah">Zakat Fitrah</option>
                            <option value="maal">Zakat Maal</option>
                            <option value="fidyah">Fidyah</option>
                            <option value="infaq_zakat">Infaq Zakat</option>
                        </SelectInput>
                        <SelectInput label="Metode" value={collectionForm.data.payment_method} onChange={(event) => collectionForm.setData('payment_method', event.target.value)} error={collectionForm.errors.payment_method}>
                            <option value="cash">Tunai</option>
                            <option value="transfer">Transfer</option>
                            <option value="qris">QRIS</option>
                            <option value="rice">Beras</option>
                        </SelectInput>
                        <TextInput label="Nominal Uang" type="number" value={collectionForm.data.money_amount || ''} onChange={(event) => collectionForm.setData('money_amount', event.target.value)} error={collectionForm.errors.money_amount} />
                        <TextInput label="Beras (kg)" type="number" step="0.01" value={collectionForm.data.rice_amount || ''} onChange={(event) => collectionForm.setData('rice_amount', event.target.value)} error={collectionForm.errors.rice_amount} />
                        <TextInput label="Tanggal Terima" type="date" value={collectionForm.data.received_at} onChange={(event) => collectionForm.setData('received_at', event.target.value)} error={collectionForm.errors.received_at} />
                        <SelectInput label="Status" value={collectionForm.data.status} onChange={(event) => collectionForm.setData('status', event.target.value)} error={collectionForm.errors.status}>
                            <option value="received">Received</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                        </SelectInput>
                        <div className="md:col-span-2">
                            <TextareaInput label="Catatan" value={collectionForm.data.notes || ''} onChange={(event) => collectionForm.setData('notes', event.target.value)} error={collectionForm.errors.notes} />
                        </div>
                    </div>
                    <PrimaryButton disabled={collectionForm.processing} className="mt-4 gap-2">
                        <Plus className="h-4 w-4" />
                        Catat Penerimaan
                    </PrimaryButton>
                </form>

                <form onSubmit={submitDistribution} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">Penyaluran Zakat</p>
                    <h3 className="text-sm font-extrabold text-slate-950">Catat Mustahik</h3>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <SelectInput label="Pilih Database Mustahik" value={distributionForm.data.zakat_participant_id || ''} onChange={(event) => selectMustahik(event.target.value)} error={distributionForm.errors.zakat_participant_id}>
                                <option value="">Input manual / belum terhubung</option>
                                {mustahikOptions.map((participant) => (
                                    <option key={participant.id} value={participant.id}>
                                        {participant.name} {participant.phone ? `- ${participant.phone}` : ''}
                                    </option>
                                ))}
                            </SelectInput>
                        </div>
                        <TextInput label="Nama Mustahik" value={distributionForm.data.mustahik_name} onChange={(event) => distributionForm.setData('mustahik_name', event.target.value)} error={distributionForm.errors.mustahik_name} />
                        <SelectInput label="Kategori" value={distributionForm.data.mustahik_category} onChange={(event) => distributionForm.setData('mustahik_category', event.target.value)} error={distributionForm.errors.mustahik_category}>
                            <option value="fakir_miskin">Fakir/Miskin</option>
                            <option value="amil">Amil</option>
                            <option value="gharim">Gharim</option>
                            <option value="fisabilillah">Fisabilillah</option>
                            <option value="ibnu_sabil">Ibnu Sabil</option>
                        </SelectInput>
                        <TextInput label="Telepon" value={distributionForm.data.phone || ''} onChange={(event) => distributionForm.setData('phone', event.target.value)} error={distributionForm.errors.phone} />
                        <WhatsappConfirmationCard
                            checked={Boolean(distributionForm.data.send_whatsapp)}
                            onChange={(checked) => distributionForm.setData('send_whatsapp', checked)}
                        />
                        <TextInput label="Tanggal Salur" type="date" value={distributionForm.data.distributed_at} onChange={(event) => distributionForm.setData('distributed_at', event.target.value)} error={distributionForm.errors.distributed_at} />
                        <TextInput label="Nominal Uang" type="number" value={distributionForm.data.money_amount || ''} onChange={(event) => distributionForm.setData('money_amount', event.target.value)} error={distributionForm.errors.money_amount} />
                        <TextInput label="Beras (kg)" type="number" step="0.01" value={distributionForm.data.rice_amount || ''} onChange={(event) => distributionForm.setData('rice_amount', event.target.value)} error={distributionForm.errors.rice_amount} />
                        <SelectInput label="Status" value={distributionForm.data.status} onChange={(event) => distributionForm.setData('status', event.target.value)} error={distributionForm.errors.status}>
                            <option value="distributed">Distributed</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="cancelled">Cancelled</option>
                        </SelectInput>
                        <div />
                        <div className="md:col-span-2">
                            <TextareaInput label="Alamat" value={distributionForm.data.address || ''} onChange={(event) => distributionForm.setData('address', event.target.value)} error={distributionForm.errors.address} />
                        </div>
                        <div className="md:col-span-2">
                            <TextareaInput label="Catatan" value={distributionForm.data.notes || ''} onChange={(event) => distributionForm.setData('notes', event.target.value)} error={distributionForm.errors.notes} />
                        </div>
                    </div>
                    <PrimaryButton disabled={distributionForm.processing} className="mt-4 gap-2">
                        <Plus className="h-4 w-4" />
                        Catat Penyaluran
                    </PrimaryButton>
                </form>
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-2">
                <History title="Riwayat Penerimaan" items={collections} type="collection" onDelete={deleteCollection} />
                <History title="Riwayat Penyaluran" items={distributions} type="distribution" onDelete={deleteDistribution} />
            </section>
        </AppLayout>
    );
}

function WhatsappConfirmationCard({ checked, onChange }) {
    return (
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
                    <CheckboxInput label="Kirim WA" checked={checked} onChange={onChange} />
                </div>
            </div>
        </div>
    );
}

function History({ title, items, type, onDelete }) {
    return (
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-950">{title}</h3>
            <div className="mt-3 space-y-2">
                {items.map((item) => (
                    <article key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className="truncate text-xs font-extrabold text-slate-950">{type === 'collection' ? item.muzakki_name : item.mustahik_name}</p>
                                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-700">
                                    {type === 'collection' ? label(item.type) : label(item.mustahik_category)} • {date(type === 'collection' ? item.received_at : item.distributed_at)}
                                </p>
                                {item.participant && <p className="mt-1 text-[10px] font-bold text-emerald-700">Terhubung: {item.participant.name}</p>}
                            </div>
                            <button className="text-rose-600" type="button" onClick={() => onDelete(item)}>
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="mt-2 text-xs font-bold text-slate-600">
                            {money(item.money_amount)} {Number(item.rice_amount || 0) > 0 && `• ${item.rice_amount} kg beras`}
                        </p>
                    </article>
                ))}
                {items.length === 0 && <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-center text-xs font-semibold text-slate-500">Belum ada data.</p>}
            </div>
        </div>
    );
}
