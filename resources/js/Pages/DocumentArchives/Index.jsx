import { router, useForm } from '@inertiajs/react';
import { Archive, Download, Edit3, FileText, Inbox, Plus, Send, Trash2, X } from 'lucide-react';
import StatCard from '../../Components/StatCard';
import { Field, PrimaryButton, SecondaryButton, SelectInput, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { date, label } from '../../lib/formatters';

const emptyForm = {
    type: 'incoming',
    letter_number: '',
    title: '',
    document_date: '',
    sender: '',
    recipient: '',
    category: '',
    status: 'archived',
    attachment: null,
    notes: '',
};

export default function Index({ documents, summary }) {
    const { data, setData, post, processing, errors, reset, transform } = useForm(emptyForm);
    const editingId = data.id || null;

    const submit = (event) => {
        event.preventDefault();

        if (editingId) {
            transform((formData) => ({ ...formData, _method: 'put' }));
            post(`/arsip-surat/${editingId}`, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => resetForm(),
                onFinish: () => transform((formData) => formData),
            });

            return;
        }

        transform((formData) => formData);
        post('/arsip-surat', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => resetForm(),
        });
    };

    const edit = (document) => {
        setData({
            ...document,
            document_date: document.document_date?.slice(0, 10) || '',
            attachment: null,
        });
    };

    const resetForm = () => {
        reset();
        setData(emptyForm);
    };

    const destroy = (document) => {
        if (window.confirm(`Hapus arsip "${document.title}"?`)) {
            router.delete(`/arsip-surat/${document.id}`);
        }
    };

    return (
        <AppLayout title="Arsip Surat">
            <section className="grid gap-4 md:grid-cols-4">
                <StatCard title="Total Arsip" value={summary.total} helper="Semua dokumen" icon={Archive} />
                <StatCard title="Surat Masuk" value={summary.incoming} helper="Dokumen diterima" icon={Inbox} tone="sky" />
                <StatCard title="Surat Keluar" value={summary.outgoing} helper="Dokumen dikirim" icon={Send} tone="amber" />
                <StatCard title="Ada Lampiran" value={summary.with_attachment} helper="File tersimpan" icon={FileText} tone="emerald" />
            </section>

            <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={submit} className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2.5">
                        <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                            <Archive className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">
                                {editingId ? 'Ubah Arsip' : 'Tambah Arsip'}
                            </p>
                            <h3 className="text-sm font-extrabold text-slate-950">Surat & Dokumen Masjid</h3>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <SelectInput label="Jenis Dokumen" value={data.type} onChange={(event) => setData('type', event.target.value)} error={errors.type}>
                            <option value="incoming">Surat Masuk</option>
                            <option value="outgoing">Surat Keluar</option>
                            <option value="internal">Internal</option>
                            <option value="other">Lainnya</option>
                        </SelectInput>
                        <SelectInput label="Status" value={data.status} onChange={(event) => setData('status', event.target.value)} error={errors.status}>
                            <option value="archived">Diarsipkan</option>
                            <option value="important">Penting</option>
                            <option value="draft">Draft</option>
                            <option value="expired">Kedaluwarsa</option>
                        </SelectInput>
                        <TextInput label="Nomor Surat" value={data.letter_number || ''} onChange={(event) => setData('letter_number', event.target.value)} error={errors.letter_number} />
                        <TextInput label="Tanggal Dokumen" type="date" value={data.document_date || ''} onChange={(event) => setData('document_date', event.target.value)} error={errors.document_date} />
                        <div className="md:col-span-2">
                            <TextInput label="Judul / Perihal" value={data.title} onChange={(event) => setData('title', event.target.value)} error={errors.title} />
                        </div>
                        <TextInput label="Pengirim" value={data.sender || ''} onChange={(event) => setData('sender', event.target.value)} error={errors.sender} />
                        <TextInput label="Penerima" value={data.recipient || ''} onChange={(event) => setData('recipient', event.target.value)} error={errors.recipient} />
                        <TextInput label="Kategori" value={data.category || ''} onChange={(event) => setData('category', event.target.value)} error={errors.category} placeholder="Undangan, izin, legal, dll" />
                        <Field label="Lampiran File" error={errors.attachment}>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                onChange={(event) => setData('attachment', event.target.files?.[0] || null)}
                                className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-teal-700"
                            />
                        </Field>
                        <div className="md:col-span-2">
                            <TextareaInput label="Catatan" value={data.notes || ''} onChange={(event) => setData('notes', event.target.value)} error={errors.notes} />
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <PrimaryButton disabled={processing} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {editingId ? 'Simpan Arsip' : 'Tambah Arsip'}
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
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-950">Daftar Arsip Surat</h3>
                    <div className="mt-3 space-y-2">
                        {documents.map((document) => (
                            <article key={document.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-extrabold text-slate-900">{document.title}</p>
                                        <p className="mt-0.5 truncate text-[11px] font-bold text-teal-700">
                                            {label(document.type)} • {document.letter_number || 'Tanpa nomor'}
                                        </p>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-teal-100 px-2 py-1 text-[10px] font-bold text-teal-700">
                                        {label(document.status)}
                                    </span>
                                </div>
                                <div className="mt-2 grid gap-1 rounded-lg bg-slate-50 p-2 text-[11px] font-semibold text-slate-600 sm:grid-cols-2">
                                    <p className="truncate">Tanggal: {date(document.document_date)}</p>
                                    <p className="truncate">Kategori: {document.category || '-'}</p>
                                    <p className="truncate">Pengirim: {document.sender || '-'}</p>
                                    <p className="truncate">Penerima: {document.recipient || '-'}</p>
                                </div>
                                <div className="mt-2 flex flex-wrap justify-end gap-2">
                                    {document.attachment_path && (
                                        <a
                                            className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2 py-2 text-xs font-bold text-sky-700"
                                            href={`/storage/${document.attachment_path}`}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <Download className="h-4 w-4" />
                                            Lampiran
                                        </a>
                                    )}
                                    <button className="rounded-lg bg-emerald-50 p-2 text-emerald-700" type="button" onClick={() => edit(document)}>
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button className="rounded-lg bg-rose-50 p-2 text-rose-600" type="button" onClick={() => destroy(document)}>
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </article>
                        ))}
                        {documents.length === 0 && <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-center text-xs font-semibold text-slate-500">Belum ada arsip surat.</p>}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
