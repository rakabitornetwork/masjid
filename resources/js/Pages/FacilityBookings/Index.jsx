import { router, useForm } from '@inertiajs/react';
import { CalendarCheck, CheckCircle2, Clock, Edit3, Plus, Trash2, UsersRound, X } from 'lucide-react';
import StatCard from '../../Components/StatCard';
import { PrimaryButton, SecondaryButton, SelectInput, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { date, label, time } from '../../lib/formatters';

const emptyForm = {
    facility_name: 'Aula Masjid',
    requester_name: '',
    requester_phone: '',
    event_name: '',
    booking_date: '',
    start_time: '',
    end_time: '',
    purpose: '',
    status: 'pending',
    notes: '',
};

const statusTone = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-rose-100 text-rose-700',
    cancelled: 'bg-slate-100 text-slate-600',
    done: 'bg-sky-100 text-sky-700',
};

export default function Index({ bookings, summary }) {
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);
    const editingId = data.id || null;

    const submit = (event) => {
        event.preventDefault();
        editingId
            ? put(`/booking-fasilitas/${editingId}`, { preserveScroll: true, onSuccess: () => resetForm() })
            : post('/booking-fasilitas', { preserveScroll: true, onSuccess: () => resetForm() });
    };

    const edit = (booking) => {
        setData({
            ...booking,
            booking_date: booking.booking_date?.slice(0, 10) || '',
            start_time: booking.start_time?.slice(0, 5) || '',
            end_time: booking.end_time?.slice(0, 5) || '',
        });
    };

    const resetForm = () => {
        reset();
        setData(emptyForm);
    };

    const destroy = (booking) => {
        if (window.confirm(`Hapus booking "${booking.event_name}"?`)) {
            router.delete(`/booking-fasilitas/${booking.id}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout title="Booking Fasilitas">
            <section className="grid gap-4 md:grid-cols-4">
                <StatCard title="Total Booking" value={summary.total} helper="Semua pengajuan" icon={CalendarCheck} />
                <StatCard title="Menunggu" value={summary.pending} helper="Perlu ditinjau" icon={Clock} tone="amber" />
                <StatCard title="Disetujui" value={summary.approved} helper="Booking aktif" icon={CheckCircle2} tone="emerald" />
                <StatCard title="Hari Ini" value={summary.today} helper="Pemakaian hari ini" icon={UsersRound} tone="sky" />
            </section>

            <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={submit} className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2.5">
                        <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                            <CalendarCheck className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">
                                {editingId ? 'Ubah Booking' : 'Tambah Booking'}
                            </p>
                            <h3 className="text-sm font-extrabold text-slate-950">Ruangan & Fasilitas Masjid</h3>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <TextInput label="Nama Fasilitas" value={data.facility_name} onChange={(event) => setData('facility_name', event.target.value)} error={errors.facility_name} placeholder="Aula, ruang kajian, sound system" />
                        <SelectInput label="Status" value={data.status} onChange={(event) => setData('status', event.target.value)} error={errors.status}>
                            <option value="pending">Menunggu</option>
                            <option value="approved">Disetujui</option>
                            <option value="rejected">Ditolak</option>
                            <option value="cancelled">Dibatalkan</option>
                            <option value="done">Selesai</option>
                        </SelectInput>
                        <div className="md:col-span-2">
                            <TextInput label="Nama Kegiatan" value={data.event_name} onChange={(event) => setData('event_name', event.target.value)} error={errors.event_name} />
                        </div>
                        <TextInput label="Nama Pemohon" value={data.requester_name} onChange={(event) => setData('requester_name', event.target.value)} error={errors.requester_name} />
                        <TextInput label="Nomor WA" value={data.requester_phone || ''} onChange={(event) => setData('requester_phone', event.target.value)} error={errors.requester_phone} placeholder="6281234567890" />
                        <TextInput label="Tanggal Booking" type="date" value={data.booking_date} onChange={(event) => setData('booking_date', event.target.value)} error={errors.booking_date} />
                        <div className="grid gap-3 sm:grid-cols-2">
                            <TextInput label="Jam Mulai" type="time" value={data.start_time || ''} onChange={(event) => setData('start_time', event.target.value)} error={errors.start_time} />
                            <TextInput label="Jam Selesai" type="time" value={data.end_time || ''} onChange={(event) => setData('end_time', event.target.value)} error={errors.end_time} />
                        </div>
                        <div className="md:col-span-2">
                            <TextareaInput label="Keperluan" value={data.purpose || ''} onChange={(event) => setData('purpose', event.target.value)} error={errors.purpose} />
                        </div>
                        <div className="md:col-span-2">
                            <TextareaInput label="Catatan Admin" value={data.notes || ''} onChange={(event) => setData('notes', event.target.value)} error={errors.notes} />
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <PrimaryButton disabled={processing} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {editingId ? 'Simpan Booking' : 'Tambah Booking'}
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
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-950">Daftar Booking Fasilitas</h3>
                    <div className="mt-3 space-y-2">
                        {bookings.map((booking) => (
                            <article key={booking.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-extrabold text-slate-900">{booking.event_name}</p>
                                        <p className="mt-0.5 truncate text-[11px] font-bold text-teal-700">
                                            {booking.facility_name} • {date(booking.booking_date)} • {time(booking.start_time)} - {time(booking.end_time)}
                                        </p>
                                    </div>
                                    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${statusTone[booking.status] || 'bg-slate-100 text-slate-600'}`}>
                                        {label(booking.status)}
                                    </span>
                                </div>
                                <div className="mt-2 grid gap-1 rounded-lg bg-slate-50 p-2 text-[11px] font-semibold text-slate-600 sm:grid-cols-2">
                                    <p className="truncate">Pemohon: {booking.requester_name}</p>
                                    <p className="truncate">WA: {booking.requester_phone || '-'}</p>
                                    <p className="truncate sm:col-span-2">Keperluan: {booking.purpose || '-'}</p>
                                </div>
                                <div className="mt-2 flex justify-end gap-2">
                                    <button className="rounded-lg bg-emerald-50 p-2 text-emerald-700" type="button" onClick={() => edit(booking)}>
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button className="rounded-lg bg-rose-50 p-2 text-rose-600" type="button" onClick={() => destroy(booking)}>
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </article>
                        ))}
                        {bookings.length === 0 && <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-center text-xs font-semibold text-slate-500">Belum ada booking fasilitas.</p>}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
