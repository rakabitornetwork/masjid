import { useForm } from '@inertiajs/react';
import { AlertTriangle, DatabaseBackup, Download, HardDriveDownload, RotateCcw, UploadCloud } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';

export default function Backup({ tables, connection, driver }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        backup_file: null,
        confirmation: '',
    });

    const restoreBackup = (event) => {
        event.preventDefault();

        if (
            !window.confirm(
                'Restore data akan mengganti data aplikasi saat ini dengan isi file backup. Lanjutkan proses restore?',
            )
        ) {
            return;
        }

        post('/backup-data/restore', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => reset('backup_file', 'confirmation'),
        });
    };

    const existingTables = tables.filter((table) => table.exists);
    const totalRows = existingTables.reduce((total, table) => total + table.rows, 0);

    return (
        <AppLayout title="Backup Data">
            <section className="grid gap-3 lg:grid-cols-3">
                <article className="rounded-xl bg-gradient-to-br from-teal-600 via-emerald-600 to-green-600 p-4 text-white shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-50/80">Database</p>
                            <h3 className="mt-1 text-lg font-extrabold">{driver}</h3>
                        </div>
                        <DatabaseBackup className="h-8 w-8 text-emerald-50" />
                    </div>
                    <p className="mt-3 text-xs font-semibold text-emerald-50/85">Connection: {connection}</p>
                </article>

                <article className="rounded-xl bg-gradient-to-br from-sky-600 via-cyan-600 to-teal-600 p-4 text-white shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-50/80">Tabel Backup</p>
                            <h3 className="mt-1 text-lg font-extrabold">{existingTables.length}</h3>
                        </div>
                        <HardDriveDownload className="h-8 w-8 text-cyan-50" />
                    </div>
                    <p className="mt-3 text-xs font-semibold text-cyan-50/85">Hanya tabel aplikasi yang masuk backup.</p>
                </article>

                <article className="rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-4 text-white shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-50/80">Total Baris</p>
                            <h3 className="mt-1 text-lg font-extrabold">{totalRows.toLocaleString('id-ID')}</h3>
                        </div>
                        <RotateCcw className="h-8 w-8 text-amber-50" />
                    </div>
                    <p className="mt-3 text-xs font-semibold text-amber-50/85">Perkiraan data yang akan disimpan.</p>
                </article>
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.1fr]">
                <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">Backup Manual</p>
                    <h3 className="mt-1 text-sm font-extrabold text-slate-950">Download File Backup JSON</h3>
                    <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                        File backup menyimpan data aplikasi seperti profil masjid, user, pengurus, keuangan, jamaah,
                        inventaris, donasi, zakat, dan qurban. Simpan file ini di tempat aman.
                    </p>
                    <a
                        href="/backup-data/download"
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-teal-700"
                    >
                        <Download className="h-4 w-4" />
                        Download Backup Sekarang
                    </a>
                </article>

                <article className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
                            <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700">Restore Data</p>
                            <h3 className="mt-1 text-sm font-extrabold text-slate-950">Pulihkan Dari File Backup</h3>
                            <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">
                                Restore akan mengganti data aplikasi saat ini. Pastikan sudah download backup terbaru sebelum
                                melakukan restore.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={restoreBackup} className="mt-4 space-y-3">
                        <label className="block">
                            <span className="text-xs font-bold text-slate-700">File backup JSON</span>
                            <input
                                type="file"
                                accept=".json,application/json"
                                onChange={(event) => setData('backup_file', event.target.files?.[0] || null)}
                                className="mt-1 block w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-teal-700"
                            />
                            {errors.backup_file && <span className="mt-1 block text-xs font-semibold text-rose-600">{errors.backup_file}</span>}
                        </label>

                        <label className="block">
                            <span className="text-xs font-bold text-slate-700">
                                Ketik <span className="font-extrabold text-rose-600">RESTORE</span> untuk konfirmasi
                            </span>
                            <input
                                type="text"
                                value={data.confirmation}
                                onChange={(event) => setData('confirmation', event.target.value)}
                                className="mt-1 block w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                placeholder="RESTORE"
                            />
                            {errors.confirmation && <span className="mt-1 block text-xs font-semibold text-rose-600">{errors.confirmation}</span>}
                        </label>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <UploadCloud className="h-4 w-4" />
                            {processing ? 'Memproses Restore...' : 'Restore Data'}
                        </button>
                    </form>
                </article>
            </section>

            <section className="mt-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">Tabel Yang Dibackup</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {tables.map((table) => (
                        <div
                            key={table.name}
                            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                                table.exists ? 'border-teal-100 bg-teal-50/70 text-slate-700' : 'border-slate-100 bg-slate-50 text-slate-400'
                            }`}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="truncate">{table.name}</span>
                                <span className="shrink-0 font-extrabold">{table.exists ? table.rows.toLocaleString('id-ID') : '-'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </AppLayout>
    );
}
