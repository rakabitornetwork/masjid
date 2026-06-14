import { Download, FileSpreadsheet } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';

export default function Index({ reports }) {
    return (
        <AppLayout title="Export Laporan">
            <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">Export CSV</p>
                <h3 className="text-sm font-extrabold text-slate-950">Download Laporan Aplikasi</h3>
                <p className="mt-2 max-w-2xl text-xs font-semibold leading-5 text-slate-500">
                    File CSV dapat dibuka di Excel, Google Sheets, atau aplikasi spreadsheet lain. Laporan yang tampil mengikuti hak akses role user.
                </p>
            </section>

            <section className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {reports.map((report) => (
                    <article key={report.key} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                                <FileSpreadsheet className="h-4 w-4" />
                            </div>
                            <a
                                href={`/laporan/export/${report.key}`}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-teal-700"
                            >
                                <Download className="h-4 w-4" />
                                Download
                            </a>
                        </div>
                        <h4 className="mt-3 text-sm font-extrabold text-slate-950">{report.label}</h4>
                        <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{report.description}</p>
                        <p className="mt-3 rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            Format: CSV
                        </p>
                    </article>
                ))}
                {reports.length === 0 && (
                    <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-center text-xs font-semibold text-slate-500 md:col-span-2 xl:col-span-3">
                        Tidak ada laporan yang dapat diexport untuk role ini.
                    </p>
                )}
            </section>
        </AppLayout>
    );
}
