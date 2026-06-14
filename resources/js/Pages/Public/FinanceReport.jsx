import { Link } from '@inertiajs/react';
import { ArrowLeft, Banknote, TrendingDown, TrendingUp, WalletCards } from 'lucide-react';
import StatCard from '../../Components/StatCard';
import PublicLayout from '../../Layouts/PublicLayout';
import { date, label, money } from '../../lib/formatters';

export default function FinanceReport({ profile, accounts, transactions, summary }) {
    return (
        <PublicLayout title="Laporan Keuangan Publik">
            <div className="py-6">
                <Link href="/" className="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-white/75 px-3 py-1.5 text-xs font-bold text-teal-700 ring-1 ring-teal-100">
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Beranda
                </Link>

                <div className="rounded-2xl border border-slate-100 bg-white/85 p-5 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-700">Transparansi Keuangan</p>
                    <h1 className="mt-1 text-2xl font-black text-slate-950">Laporan Keuangan {profile?.name || 'Masjid'}</h1>
                    <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                        Ringkasan ini menampilkan transaksi berstatus posted agar jamaah dapat memantau pemasukan, pengeluaran, dan saldo bersih masjid.
                    </p>
                </div>

                <section className="mt-4 grid gap-4 md:grid-cols-3">
                    <StatCard title="Pemasukan" value={money(summary.income)} helper="Transaksi posted" icon={TrendingUp} />
                    <StatCard title="Pengeluaran" value={money(summary.expense)} helper="Transaksi posted" icon={TrendingDown} tone="rose" />
                    <StatCard title="Saldo Bersih" value={money(summary.balance)} helper="Income - expense" icon={Banknote} tone="amber" />
                </section>

                <section className="mt-4 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
                    <div className="rounded-2xl border border-slate-100 bg-white/85 p-4 shadow-sm">
                        <div className="mb-3 flex items-center gap-2">
                            <WalletCards className="h-4 w-4 text-teal-600" />
                            <h2 className="text-xs font-black uppercase tracking-[0.14em] text-slate-950">Akun Kas Aktif</h2>
                        </div>
                        <div className="space-y-2">
                            {accounts.map((account) => (
                                <div key={account.id} className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-xs font-extrabold text-slate-950">{account.name}</p>
                                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-teal-700">{label(account.type)}</span>
                                    </div>
                                    <p className="mt-1 text-sm font-black text-emerald-700">{money(account.balance)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white/85 p-4 shadow-sm">
                        <div className="mb-3 flex items-center gap-2">
                            <Banknote className="h-4 w-4 text-teal-600" />
                            <h2 className="text-xs font-black uppercase tracking-[0.14em] text-slate-950">Transaksi Terbaru</h2>
                        </div>
                        <div className="space-y-2">
                            {transactions.map((transaction) => (
                                <article key={transaction.id} className="rounded-xl border border-slate-100 bg-white p-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-extrabold text-slate-950">{transaction.description}</p>
                                            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                                {date(transaction.transaction_date)} • {transaction.account?.name || '-'} • {transaction.category?.name || '-'}
                                            </p>
                                        </div>
                                        <p className={`shrink-0 text-xs font-black ${transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {money(transaction.amount)}
                                        </p>
                                    </div>
                                </article>
                            ))}
                            {transactions.length === 0 && <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-center text-xs font-semibold text-slate-500">Belum ada transaksi posted.</p>}
                        </div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}
