import { router, useForm } from '@inertiajs/react';
import { Edit3, Plus, Trash2, WalletCards, X } from 'lucide-react';
import { CheckboxInput, PrimaryButton, SecondaryButton, SelectInput, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { label, money } from '../../lib/formatters';

const emptyForm = {
    name: '',
    type: 'cash',
    bank_name: '',
    account_number: '',
    account_holder: '',
    opening_balance: 0,
    is_active: true,
    notes: '',
};

export default function Accounts({ accounts }) {
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);
    const editingId = data.id || null;

    const submit = (event) => {
        event.preventDefault();
        editingId
            ? put(`/keuangan/akun/${editingId}`, { onSuccess: () => resetForm() })
            : post('/keuangan/akun', { onSuccess: () => resetForm() });
    };

    const edit = (account) => setData({ ...account });

    const resetForm = () => {
        reset();
        setData(emptyForm);
    };

    const destroy = (account) => {
        if (window.confirm(`Hapus akun "${account.name}"?`)) {
            router.delete(`/keuangan/akun/${account.id}`);
        }
    };

    return (
        <AppLayout title="Akun Kas & Bank">
            <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
                <form onSubmit={submit} className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-emerald-950/5">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                            <WalletCards className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">{editingId ? 'Ubah Akun' : 'Tambah Akun'}</p>
                            <h3 className="text-lg font-black text-slate-950">Kas, Bank, QRIS, E-Wallet</h3>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <TextInput label="Nama Akun" value={data.name} onChange={(event) => setData('name', event.target.value)} error={errors.name} />
                        <SelectInput label="Jenis" value={data.type} onChange={(event) => setData('type', event.target.value)} error={errors.type}>
                            <option value="cash">Kas Tunai</option>
                            <option value="bank">Bank</option>
                            <option value="e_wallet">E-Wallet / QRIS</option>
                        </SelectInput>
                        <TextInput
                            label="Saldo Awal"
                            type="number"
                            value={data.opening_balance}
                            onChange={(event) => setData('opening_balance', event.target.value)}
                            error={errors.opening_balance}
                        />
                        <CheckboxInput label="Aktif" checked={Boolean(data.is_active)} onChange={(value) => setData('is_active', value)} />
                        <TextInput
                            label="Nama Bank"
                            value={data.bank_name || ''}
                            onChange={(event) => setData('bank_name', event.target.value)}
                            error={errors.bank_name}
                        />
                        <TextInput
                            label="Nomor Rekening"
                            value={data.account_number || ''}
                            onChange={(event) => setData('account_number', event.target.value)}
                            error={errors.account_number}
                        />
                        <div className="md:col-span-2">
                            <TextInput
                                label="Atas Nama"
                                value={data.account_holder || ''}
                                onChange={(event) => setData('account_holder', event.target.value)}
                                error={errors.account_holder}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <TextareaInput label="Catatan" value={data.notes || ''} onChange={(event) => setData('notes', event.target.value)} error={errors.notes} />
                        </div>
                    </div>

                    <div className="mt-5 flex gap-2">
                        <PrimaryButton disabled={processing} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {editingId ? 'Simpan Perubahan' : 'Tambah Akun'}
                        </PrimaryButton>
                        {editingId && (
                            <SecondaryButton type="button" onClick={resetForm} className="gap-2">
                                <X className="h-4 w-4" />
                                Batal
                            </SecondaryButton>
                        )}
                    </div>
                </form>

                <section className="grid gap-4 md:grid-cols-2">
                    {accounts.map((account) => (
                        <article key={account.id} className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-emerald-950/5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">{label(account.type)}</p>
                                    <h3 className="mt-1 text-lg font-black text-slate-950">{account.name}</h3>
                                </div>
                                <span className={`rounded-full px-2 py-1 text-xs font-bold ${account.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {account.is_active ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>
                            <p className="mt-4 text-2xl font-black text-slate-950">{money(account.balance)}</p>
                            <p className="mt-1 text-sm text-slate-500">Saldo awal: {money(account.opening_balance)}</p>
                            {(account.bank_name || account.account_number) && (
                                <p className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm text-slate-600">
                                    {account.bank_name} {account.account_number} {account.account_holder && `a.n. ${account.account_holder}`}
                                </p>
                            )}
                            <div className="mt-4 flex gap-2">
                                <SecondaryButton type="button" onClick={() => edit(account)} className="gap-2">
                                    <Edit3 className="h-4 w-4" />
                                    Edit
                                </SecondaryButton>
                                <SecondaryButton type="button" onClick={() => destroy(account)} className="gap-2 text-rose-600">
                                    <Trash2 className="h-4 w-4" />
                                    Hapus
                                </SecondaryButton>
                            </div>
                        </article>
                    ))}
                    {accounts.length === 0 && <p className="rounded-[1.75rem] bg-white/85 p-6 text-center text-sm text-slate-500 md:col-span-2">Belum ada akun kas/bank.</p>}
                </section>
            </div>
        </AppLayout>
    );
}
