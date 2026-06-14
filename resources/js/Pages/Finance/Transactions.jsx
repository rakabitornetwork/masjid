import { router, useForm } from '@inertiajs/react';
import { Banknote, Edit3, Plus, Trash2, TrendingDown, TrendingUp, X } from 'lucide-react';
import StatCard from '../../Components/StatCard';
import { PrimaryButton, SecondaryButton, SelectInput, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { date, label, money } from '../../lib/formatters';

const today = new Date().toISOString().slice(0, 10);

export default function Transactions({ transactions, accounts, categories, summary }) {
    const firstIncomeCategory = categories.find((category) => category.type === 'income');
    const { data, setData, post, put, processing, errors, reset } = useForm({
        financial_account_id: accounts[0]?.id || '',
        financial_category_id: firstIncomeCategory?.id || '',
        type: 'income',
        transaction_date: today,
        reference_number: '',
        source: '',
        description: '',
        amount: '',
        payment_method: 'cash',
        status: 'posted',
    });
    const editingId = data.id || null;
    const filteredCategories = categories.filter((category) => category.type === data.type);

    const submit = (event) => {
        event.preventDefault();
        editingId
            ? put(`/keuangan/transaksi/${editingId}`, { onSuccess: () => resetForm() })
            : post('/keuangan/transaksi', { onSuccess: () => resetForm() });
    };

    const changeType = (type) => {
        const firstCategory = categories.find((category) => category.type === type);
        setData({
            ...data,
            type,
            financial_category_id: firstCategory?.id || '',
        });
    };

    const edit = (transaction) => {
        setData({
            ...transaction,
            transaction_date: transaction.transaction_date?.slice(0, 10) || today,
        });
    };

    const resetForm = () => {
        reset();
        const firstCategory = categories.find((category) => category.type === 'income');
        setData({
            financial_account_id: accounts[0]?.id || '',
            financial_category_id: firstCategory?.id || '',
            type: 'income',
            transaction_date: today,
            reference_number: '',
            source: '',
            description: '',
            amount: '',
            payment_method: 'cash',
            status: 'posted',
        });
    };

    const destroy = (transaction) => {
        if (window.confirm(`Hapus transaksi "${transaction.description}"?`)) {
            router.delete(`/keuangan/transaksi/${transaction.id}`);
        }
    };

    return (
        <AppLayout title="Transaksi Keuangan">
            <section className="grid gap-4 md:grid-cols-3">
                <StatCard title="Total Pemasukan" value={money(summary.income)} helper="Semua transaksi posted" icon={TrendingUp} tone="emerald" />
                <StatCard title="Total Pengeluaran" value={money(summary.expense)} helper="Semua transaksi posted" icon={TrendingDown} tone="rose" />
                <StatCard title="Saldo Bersih" value={money(summary.income - summary.expense)} helper="Belum termasuk saldo awal akun" icon={Banknote} tone="amber" />
            </section>

            <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[0.82fr_1.18fr]">
                <form onSubmit={submit} className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">{editingId ? 'Ubah Transaksi' : 'Tambah Transaksi'}</p>
                        <h3 className="text-sm font-extrabold text-slate-950">Pemasukan / Pengeluaran</h3>
                    </div>

                    {(accounts.length === 0 || categories.length === 0) && (
                        <p className="mb-3 rounded-lg bg-amber-50 p-3 text-xs font-semibold text-amber-800">
                            Tambahkan akun kas/bank dan kategori aktif terlebih dahulu sebelum mencatat transaksi.
                        </p>
                    )}

                    <div className="grid gap-3 md:grid-cols-2">
                        <SelectInput label="Jenis" value={data.type} onChange={(event) => changeType(event.target.value)} error={errors.type}>
                            <option value="income">Pemasukan</option>
                            <option value="expense">Pengeluaran</option>
                        </SelectInput>
                        <SelectInput
                            label="Status"
                            value={data.status}
                            onChange={(event) => setData('status', event.target.value)}
                            error={errors.status}
                        >
                            <option value="posted">Posted</option>
                            <option value="draft">Draft</option>
                        </SelectInput>
                        <SelectInput
                            label="Akun"
                            value={data.financial_account_id}
                            onChange={(event) => setData('financial_account_id', event.target.value)}
                            error={errors.financial_account_id}
                        >
                            <option value="">Pilih akun</option>
                            {accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.name}
                                </option>
                            ))}
                        </SelectInput>
                        <SelectInput
                            label="Kategori"
                            value={data.financial_category_id}
                            onChange={(event) => setData('financial_category_id', event.target.value)}
                            error={errors.financial_category_id}
                        >
                            <option value="">Pilih kategori</option>
                            {filteredCategories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </SelectInput>
                        <TextInput
                            label="Tanggal"
                            type="date"
                            value={data.transaction_date}
                            onChange={(event) => setData('transaction_date', event.target.value)}
                            error={errors.transaction_date}
                        />
                        <TextInput label="Nominal" type="number" value={data.amount} onChange={(event) => setData('amount', event.target.value)} error={errors.amount} />
                        <SelectInput
                            label="Metode"
                            value={data.payment_method}
                            onChange={(event) => setData('payment_method', event.target.value)}
                            error={errors.payment_method}
                        >
                            <option value="cash">Tunai</option>
                            <option value="transfer">Transfer</option>
                            <option value="qris">QRIS</option>
                            <option value="e_wallet">E-Wallet</option>
                        </SelectInput>
                        <TextInput
                            label="Nomor Referensi"
                            value={data.reference_number || ''}
                            onChange={(event) => setData('reference_number', event.target.value)}
                            error={errors.reference_number}
                        />
                        <div className="md:col-span-2">
                            <TextInput label="Sumber / Penerima" value={data.source || ''} onChange={(event) => setData('source', event.target.value)} error={errors.source} />
                        </div>
                        <div className="md:col-span-2">
                            <TextareaInput
                                label="Deskripsi"
                                value={data.description}
                                onChange={(event) => setData('description', event.target.value)}
                                error={errors.description}
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <PrimaryButton disabled={processing || accounts.length === 0 || categories.length === 0} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {editingId ? 'Simpan Perubahan' : 'Tambah Transaksi'}
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
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-950">Riwayat Transaksi</h3>
                    <div className="mt-3 space-y-2 md:hidden">
                        {transactions.map((transaction) => (
                            <div key={transaction.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-extrabold text-slate-900">{transaction.description}</p>
                                        <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{date(transaction.transaction_date)}</p>
                                    </div>
                                    <p className={`shrink-0 text-right text-xs font-black ${transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {money(transaction.amount)}
                                    </p>
                                </div>
                                <div className="mt-2 grid gap-1 rounded-lg bg-slate-50 p-2 text-[11px] font-semibold text-slate-600">
                                    <p className="truncate">Akun: {transaction.account?.name || '-'}</p>
                                    <p className="truncate">Kategori: {transaction.category?.name || '-'}</p>
                                    <p className="truncate">
                                        {label(transaction.type)} • {label(transaction.payment_method)} • {label(transaction.status)}
                                    </p>
                                </div>
                                <div className="mt-2 flex justify-end gap-2">
                                    <button className="rounded-lg bg-emerald-50 p-2 text-emerald-700" type="button" onClick={() => edit(transaction)}>
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button className="rounded-lg bg-rose-50 p-2 text-rose-600" type="button" onClick={() => destroy(transaction)}>
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {transactions.length === 0 && <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-center text-xs font-semibold text-slate-500">Belum ada transaksi.</p>}
                    </div>
                    <div className="mt-3 hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[900px] text-left text-xs">
                            <thead className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                                <tr>
                                    <th className="py-3">Tanggal</th>
                                    <th>Deskripsi</th>
                                    <th>Akun</th>
                                    <th>Kategori</th>
                                    <th className="text-right">Nominal</th>
                                    <th className="text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-50">
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td className="py-2.5 text-xs text-slate-500">{date(transaction.transaction_date)}</td>
                                        <td>
                                            <p className="text-xs font-bold text-slate-900">{transaction.description}</p>
                                            <p className="text-[10px] text-slate-500">
                                                {label(transaction.type)} • {label(transaction.payment_method)} • {label(transaction.status)}
                                            </p>
                                        </td>
                                        <td>{transaction.account?.name || '-'}</td>
                                        <td>{transaction.category?.name || '-'}</td>
                                        <td className={`text-right font-black ${transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {money(transaction.amount)}
                                        </td>
                                        <td className="text-right">
                                            <button className="mr-2 text-emerald-700" type="button" onClick={() => edit(transaction)}>
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                            <button className="text-rose-600" type="button" onClick={() => destroy(transaction)}>
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-slate-500">
                                            Belum ada transaksi.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
