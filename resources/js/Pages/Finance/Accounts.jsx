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
                <form onSubmit={submit} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2.5">
                        <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                            <WalletCards className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">{editingId ? 'Ubah Akun' : 'Tambah Akun'}</p>
                            <h3 className="text-sm font-extrabold text-slate-950">Kas, Bank, QRIS, E-Wallet</h3>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
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

                    <div className="mt-4 flex gap-2">
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
                        <article key={account.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-2.5">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">{label(account.type)}</p>
                                    <h3 className="mt-0.5 text-sm font-extrabold text-slate-950">{account.name}</h3>
                                </div>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${account.is_active ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {account.is_active ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>
                            <p className="mt-3 text-base font-extrabold text-slate-950">{money(account.balance)}</p>
                            <p className="mt-0.5 text-[10px] font-semibold text-slate-500">Saldo awal: {money(account.opening_balance)}</p>
                            {(account.bank_name || account.account_number) && (
                                <p className="mt-2 rounded-lg bg-teal-50 p-2.5 text-xs font-medium text-slate-600">
                                    {account.bank_name} {account.account_number} {account.account_holder && `a.n. ${account.account_holder}`}
                                </p>
                            )}
                            <div className="mt-3 flex gap-2">
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
                    {accounts.length === 0 && <p className="rounded-xl bg-white p-4 text-center text-xs font-semibold text-slate-500 shadow-sm md:col-span-2">Belum ada akun kas/bank.</p>}
                </section>
            </div>
        </AppLayout>
    );
}
