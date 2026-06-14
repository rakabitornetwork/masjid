import { router, useForm } from '@inertiajs/react';
import { CalendarDays, Edit3, Plus, Trash2, X } from 'lucide-react';
import { PrimaryButton, SecondaryButton, SelectInput, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { date, label, time } from '../../lib/formatters';

const emptyForm = {
    title: '',
    type: 'kegiatan',
    date: '',
    start_time: '',
    end_time: '',
    location: 'Masjid',
    speaker: '',
    imam: '',
    khatib: '',
    muadzin: '',
    description: '',
    status: 'scheduled',
};

export default function Index({ schedules }) {
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);
    const editingId = data.id || null;

    const submit = (event) => {
        event.preventDefault();
        editingId ? put(`/jadwal/${editingId}`, { onSuccess: () => resetForm() }) : post('/jadwal', { onSuccess: () => resetForm() });
    };

    const edit = (schedule) => {
        setData({
            ...schedule,
            date: schedule.date?.slice(0, 10) || '',
            start_time: schedule.start_time?.slice(0, 5) || '',
            end_time: schedule.end_time?.slice(0, 5) || '',
        });
    };

    const resetForm = () => {
        reset();
        setData(emptyForm);
    };

    const destroy = (schedule) => {
        if (window.confirm(`Hapus jadwal "${schedule.title}"?`)) {
            router.delete(`/jadwal/${schedule.id}`);
        }
    };

    return (
        <AppLayout title="Jadwal Ibadah & Kegiatan">
            <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={submit} className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-emerald-950/5">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                            <CalendarDays className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">{editingId ? 'Ubah Jadwal' : 'Tambah Jadwal'}</p>
                            <h3 className="text-lg font-black text-slate-950">Jumat, Kajian, dan Kegiatan</h3>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <TextInput label="Judul" value={data.title} onChange={(event) => setData('title', event.target.value)} error={errors.title} />
                        </div>
                        <SelectInput label="Jenis" value={data.type} onChange={(event) => setData('type', event.target.value)} error={errors.type}>
                            <option value="friday_prayer">Shalat Jumat</option>
                            <option value="kajian">Kajian</option>
                            <option value="kegiatan">Kegiatan</option>
                            <option value="ramadhan">Ramadhan</option>
                            <option value="eid">Idul Fitri / Adha</option>
                            <option value="service">Layanan Masjid</option>
                        </SelectInput>
                        <SelectInput label="Status" value={data.status} onChange={(event) => setData('status', event.target.value)} error={errors.status}>
                            <option value="scheduled">Terjadwal</option>
                            <option value="done">Selesai</option>
                            <option value="canceled">Dibatalkan</option>
                        </SelectInput>
                        <TextInput label="Tanggal" type="date" value={data.date} onChange={(event) => setData('date', event.target.value)} error={errors.date} />
                        <TextInput
                            label="Lokasi"
                            value={data.location || ''}
                            onChange={(event) => setData('location', event.target.value)}
                            error={errors.location}
                        />
                        <TextInput
                            label="Jam Mulai"
                            type="time"
                            value={data.start_time || ''}
                            onChange={(event) => setData('start_time', event.target.value)}
                            error={errors.start_time}
                        />
                        <TextInput
                            label="Jam Selesai"
                            type="time"
                            value={data.end_time || ''}
                            onChange={(event) => setData('end_time', event.target.value)}
                            error={errors.end_time}
                        />
                        <TextInput label="Pembicara" value={data.speaker || ''} onChange={(event) => setData('speaker', event.target.value)} error={errors.speaker} />
                        <TextInput label="Imam" value={data.imam || ''} onChange={(event) => setData('imam', event.target.value)} error={errors.imam} />
                        <TextInput label="Khatib" value={data.khatib || ''} onChange={(event) => setData('khatib', event.target.value)} error={errors.khatib} />
                        <TextInput label="Muadzin" value={data.muadzin || ''} onChange={(event) => setData('muadzin', event.target.value)} error={errors.muadzin} />
                        <div className="md:col-span-2">
                            <TextareaInput
                                label="Deskripsi"
                                value={data.description || ''}
                                onChange={(event) => setData('description', event.target.value)}
                                error={errors.description}
                            />
                        </div>
                    </div>

                    <div className="mt-5 flex gap-2">
                        <PrimaryButton disabled={processing} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {editingId ? 'Simpan Perubahan' : 'Tambah Jadwal'}
                        </PrimaryButton>
                        {editingId && (
                            <SecondaryButton type="button" onClick={resetForm} className="gap-2">
                                <X className="h-4 w-4" />
                                Batal
                            </SecondaryButton>
                        )}
                    </div>
                </form>

                <section className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-emerald-950/5">
                    <h3 className="text-lg font-black text-slate-950">Kalender Ringkas</h3>
                    <div className="mt-4 space-y-3">
                        {schedules.map((schedule) => (
                            <article key={schedule.id} className="rounded-2xl border border-emerald-50 bg-white p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                                            {date(schedule.date)} • {time(schedule.start_time)} - {time(schedule.end_time)}
                                        </p>
                                        <h4 className="mt-1 font-black text-slate-950">{schedule.title}</h4>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {label(schedule.type)} • {schedule.location || 'Masjid'} • {label(schedule.status)}
                                        </p>
                                        {(schedule.khatib || schedule.imam || schedule.speaker) && (
                                            <p className="mt-2 text-sm text-slate-600">
                                                {schedule.speaker && `Pembicara: ${schedule.speaker} `}
                                                {schedule.khatib && `Khatib: ${schedule.khatib} `}
                                                {schedule.imam && `Imam: ${schedule.imam}`}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="text-emerald-700" type="button" onClick={() => edit(schedule)}>
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                        <button className="text-rose-600" type="button" onClick={() => destroy(schedule)}>
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                        {schedules.length === 0 && <p className="rounded-2xl bg-emerald-50 p-5 text-center text-sm text-slate-500">Belum ada jadwal.</p>}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
