import { router, useForm } from '@inertiajs/react';
import { Edit3, MessageCircle, Plus, Trash2, UserRoundCheck, UsersRound, WalletCards, X } from 'lucide-react';
import StatCard from '../../Components/StatCard';
import { CheckboxInput, PrimaryButton, SecondaryButton, SelectInput, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { label } from '../../lib/formatters';

const emptyForm = {
    role: 'mustahik',
    name: '',
    phone: '',
    identity_number: '',
    address: '',
    family_count: 1,
    muzakki_type: 'personal',
    mustahik_category: 'fakir_miskin',
    occupation: '',
    income_range: '',
    is_active: true,
    notes: '',
    send_whatsapp: true,
};

const roleLabels = {
    muzakki: 'Muzakki',
    mustahik: 'Mustahik',
    both: 'Muzakki & Mustahik',
};

const roleTone = {
    muzakki: 'bg-emerald-100 text-emerald-700',
    mustahik: 'bg-amber-100 text-amber-700',
    both: 'bg-teal-100 text-teal-700',
};

export default function Index({ participants, summary, api }) {
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);
    const editingId = data.id || null;

    const submit = (event) => {
        event.preventDefault();
        editingId
            ? put(`/muzakki-mustahik/${editingId}`, { preserveScroll: true, onSuccess: resetForm })
            : post('/muzakki-mustahik', { preserveScroll: true, onSuccess: resetForm });
    };

    const edit = (participant) => {
        setData({
            ...participant,
            family_count: participant.family_count || 1,
            muzakki_type: participant.muzakki_type || 'personal',
            mustahik_category: participant.mustahik_category || 'fakir_miskin',
            is_active: Boolean(participant.is_active),
            send_whatsapp: false,
        });
    };

    const resetForm = () => {
        reset();
        setData(emptyForm);
    };

    const destroy = (participant) => {
        if (window.confirm(`Hapus data ${participant.name}?`)) {
            router.delete(`/muzakki-mustahik/${participant.id}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout title="Muzakki & Mustahik">
            <section className="grid gap-4 md:grid-cols-4">
                <StatCard title="Total Data" value={summary.total} helper="Database zakat" icon={UsersRound} />
                <StatCard title="Data Aktif" value={summary.active} helper="Siap digunakan" icon={UserRoundCheck} tone="emerald" />
                <StatCard title="Muzakki" value={summary.muzakki} helper="Pemberi zakat" icon={WalletCards} tone="sky" />
                <StatCard title="Keluarga Mustahik" value={summary.mustahikFamilies} helper="Total anggota keluarga" icon={UsersRound} tone="amber" />
            </section>

            <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={submit} className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2.5">
                        <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                            <UsersRound className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">{editingId ? 'Ubah Data' : 'Tambah Data'}</p>
                            <h3 className="text-sm font-extrabold text-slate-950">Profil Muzakki & Mustahik</h3>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <SelectInput label="Jenis Data" value={data.role} onChange={(event) => setData('role', event.target.value)} error={errors.role}>
                            <option value="mustahik">Mustahik</option>
                            <option value="muzakki">Muzakki</option>
                            <option value="both">Muzakki & Mustahik</option>
                        </SelectInput>
                        <CheckboxInput label="Data aktif" checked={Boolean(data.is_active)} onChange={(checked) => setData('is_active', checked)} />
                        <TextInput label="Nama" value={data.name} onChange={(event) => setData('name', event.target.value)} error={errors.name} />
                        <TextInput label="Nomor WA" value={data.phone || ''} onChange={(event) => setData('phone', event.target.value)} error={errors.phone} />
                        {!editingId && (
                            <div className="md:col-span-2 rounded-xl border border-teal-100 bg-teal-50/70 p-3">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex items-start gap-2.5">
                                        <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                                            <MessageCircle className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">Konfirmasi WhatsApp</p>
                                            <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-600">
                                                Kirim pesan otomatis ke nomor WA setelah data berhasil ditambahkan. Riwayatnya akan masuk ke menu Notifikasi WhatsApp.
                                            </p>
                                            <p className={`mt-1 text-[11px] font-bold ${api?.enabled ? 'text-emerald-700' : 'text-amber-700'}`}>
                                                {api?.enabled ? `Gateway aktif: ${api.provider}` : 'Gateway WhatsApp belum aktif, data tetap bisa disimpan.'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        <CheckboxInput label="Kirim WA" checked={Boolean(data.send_whatsapp)} onChange={(checked) => setData('send_whatsapp', checked)} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <TextInput label="NIK / Identitas" value={data.identity_number || ''} onChange={(event) => setData('identity_number', event.target.value)} error={errors.identity_number} />
                        <TextInput label="Jumlah Keluarga" type="number" min="1" value={data.family_count || 1} onChange={(event) => setData('family_count', event.target.value)} error={errors.family_count} />
                        <SelectInput label="Tipe Muzakki" value={data.muzakki_type || 'personal'} onChange={(event) => setData('muzakki_type', event.target.value)} error={errors.muzakki_type}>
                            <option value="personal">Perorangan</option>
                            <option value="family">Keluarga</option>
                            <option value="business">Usaha/Perusahaan</option>
                            <option value="institution">Lembaga</option>
                        </SelectInput>
                        <SelectInput label="Kategori Mustahik" value={data.mustahik_category || 'fakir_miskin'} onChange={(event) => setData('mustahik_category', event.target.value)} error={errors.mustahik_category}>
                            <option value="fakir_miskin">Fakir/Miskin</option>
                            <option value="amil">Amil</option>
                            <option value="muallaf">Muallaf</option>
                            <option value="gharim">Gharim</option>
                            <option value="fisabilillah">Fisabilillah</option>
                            <option value="ibnu_sabil">Ibnu Sabil</option>
                            <option value="other">Lainnya</option>
                        </SelectInput>
                        <TextInput label="Pekerjaan" value={data.occupation || ''} onChange={(event) => setData('occupation', event.target.value)} error={errors.occupation} />
                        <SelectInput label="Rentang Penghasilan" value={data.income_range || ''} onChange={(event) => setData('income_range', event.target.value)} error={errors.income_range}>
                            <option value="">Belum diisi</option>
                            <option value="under_1m">&lt; Rp1 juta</option>
                            <option value="1m_3m">Rp1 juta - Rp3 juta</option>
                            <option value="3m_5m">Rp3 juta - Rp5 juta</option>
                            <option value="above_5m">&gt; Rp5 juta</option>
                        </SelectInput>
                        <div className="md:col-span-2">
                            <TextareaInput label="Alamat" value={data.address || ''} onChange={(event) => setData('address', event.target.value)} error={errors.address} />
                        </div>
                        <div className="md:col-span-2">
                            <TextareaInput label="Catatan" value={data.notes || ''} onChange={(event) => setData('notes', event.target.value)} error={errors.notes} />
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <PrimaryButton disabled={processing} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {editingId ? 'Simpan Data' : 'Tambah Data'}
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
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-950">Database Muzakki & Mustahik</h3>
                    <div className="mt-3 space-y-2">
                        {participants.map((participant) => (
                            <article key={participant.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-extrabold text-slate-900">{participant.name}</p>
                                        <p className="mt-0.5 truncate text-[11px] font-bold text-teal-700">
                                            {participant.phone || '-'} • {label(participant.mustahik_category || participant.muzakki_type || participant.role)}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 flex-col items-end gap-1">
                                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${roleTone[participant.role] || 'bg-slate-100 text-slate-600'}`}>{roleLabels[participant.role]}</span>
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${participant.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {participant.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-2 grid gap-1 rounded-lg bg-slate-50 p-2 text-[11px] font-semibold text-slate-600 sm:grid-cols-2">
                                    <p className="truncate">Keluarga: {participant.family_count || 1} orang</p>
                                    <p className="truncate">Pekerjaan: {participant.occupation || '-'}</p>
                                    <p className="truncate sm:col-span-2">Alamat: {participant.address || '-'}</p>
                                </div>
                                <div className="mt-2 flex justify-end gap-2">
                                    <button className="rounded-lg bg-emerald-50 p-2 text-emerald-700" type="button" onClick={() => edit(participant)}>
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button className="rounded-lg bg-rose-50 p-2 text-rose-600" type="button" onClick={() => destroy(participant)}>
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </article>
                        ))}
                        {participants.length === 0 && <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-center text-xs font-semibold text-slate-500">Belum ada data muzakki/mustahik.</p>}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
