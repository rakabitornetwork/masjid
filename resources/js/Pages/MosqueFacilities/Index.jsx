import { router, useForm } from '@inertiajs/react';
import { Building2, CalendarCheck, Edit3, Plus, Trash2, UsersRound, Wrench, X } from 'lucide-react';
import StatCard from '../../Components/StatCard';
import { CheckboxInput, PrimaryButton, SecondaryButton, SelectInput, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { label, money } from '../../lib/formatters';

const emptyForm = {
    name: '',
    category: 'room',
    location: '',
    capacity: 0,
    condition: 'good',
    availability_status: 'available',
    booking_fee: '',
    responsible_person: '',
    responsible_phone: '',
    is_bookable: true,
    is_active: true,
    notes: '',
};

const availabilityTone = {
    available: 'bg-emerald-100 text-emerald-700',
    booked: 'bg-sky-100 text-sky-700',
    maintenance: 'bg-amber-100 text-amber-700',
    unavailable: 'bg-slate-100 text-slate-600',
};

export default function Index({ facilities, summary }) {
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);
    const editingId = data.id || null;

    const submit = (event) => {
        event.preventDefault();
        editingId
            ? put(`/fasilitas-masjid/${editingId}`, { preserveScroll: true, onSuccess: resetForm })
            : post('/fasilitas-masjid', { preserveScroll: true, onSuccess: resetForm });
    };

    const edit = (facility) => {
        setData({
            ...facility,
            capacity: facility.capacity || 0,
            booking_fee: facility.booking_fee || '',
            is_bookable: Boolean(facility.is_bookable),
            is_active: Boolean(facility.is_active),
        });
    };

    const resetForm = () => {
        reset();
        setData(emptyForm);
    };

    const destroy = (facility) => {
        if (window.confirm(`Hapus fasilitas "${facility.name}"?`)) {
            router.delete(`/fasilitas-masjid/${facility.id}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout title="Data Fasilitas">
            <section className="grid gap-4 md:grid-cols-4">
                <StatCard title="Total Fasilitas" value={summary.total} helper="Semua fasilitas" icon={Building2} />
                <StatCard title="Aktif" value={summary.active} helper="Masih digunakan" icon={Building2} tone="emerald" />
                <StatCard title="Bisa Booking" value={summary.bookable} helper="Tersedia untuk jadwal" icon={CalendarCheck} tone="sky" />
                <StatCard title="Perawatan" value={summary.maintenance} helper="Butuh tindak lanjut" icon={Wrench} tone="amber" />
            </section>

            <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[0.85fr_1.15fr]">
                <form onSubmit={submit} className="min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2.5">
                        <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                            <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">{editingId ? 'Ubah Fasilitas' : 'Tambah Fasilitas'}</p>
                            <h3 className="text-sm font-extrabold text-slate-950">Ruangan, Area, dan Peralatan</h3>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <TextInput label="Nama Fasilitas" value={data.name} onChange={(event) => setData('name', event.target.value)} error={errors.name} />
                        <SelectInput label="Kategori" value={data.category} onChange={(event) => setData('category', event.target.value)} error={errors.category}>
                            <option value="room">Ruangan</option>
                            <option value="hall">Aula</option>
                            <option value="equipment">Peralatan</option>
                            <option value="vehicle">Kendaraan</option>
                            <option value="parking">Parkir</option>
                            <option value="yard">Halaman</option>
                            <option value="service">Layanan</option>
                            <option value="other">Lainnya</option>
                        </SelectInput>
                        <TextInput label="Lokasi" value={data.location || ''} onChange={(event) => setData('location', event.target.value)} error={errors.location} />
                        <TextInput label="Kapasitas" type="number" min="0" value={data.capacity || 0} onChange={(event) => setData('capacity', event.target.value)} error={errors.capacity} />
                        <SelectInput label="Kondisi" value={data.condition} onChange={(event) => setData('condition', event.target.value)} error={errors.condition}>
                            <option value="good">Baik</option>
                            <option value="minor_damage">Rusak Ringan</option>
                            <option value="damaged">Rusak</option>
                            <option value="maintenance">Perawatan</option>
                        </SelectInput>
                        <SelectInput label="Ketersediaan" value={data.availability_status} onChange={(event) => setData('availability_status', event.target.value)} error={errors.availability_status}>
                            <option value="available">Tersedia</option>
                            <option value="booked">Sedang Dipakai</option>
                            <option value="maintenance">Perawatan</option>
                            <option value="unavailable">Tidak Tersedia</option>
                        </SelectInput>
                        <TextInput label="Biaya Booking" type="number" value={data.booking_fee || ''} onChange={(event) => setData('booking_fee', event.target.value)} error={errors.booking_fee} />
                        <TextInput label="Penanggung Jawab" value={data.responsible_person || ''} onChange={(event) => setData('responsible_person', event.target.value)} error={errors.responsible_person} />
                        <TextInput label="Nomor WA PJ" value={data.responsible_phone || ''} onChange={(event) => setData('responsible_phone', event.target.value)} error={errors.responsible_phone} />
                        <div className="grid gap-2 sm:grid-cols-2">
                            <CheckboxInput label="Bisa dibooking" checked={Boolean(data.is_bookable)} onChange={(checked) => setData('is_bookable', checked)} />
                            <CheckboxInput label="Aktif" checked={Boolean(data.is_active)} onChange={(checked) => setData('is_active', checked)} />
                        </div>
                        <div className="md:col-span-2">
                            <TextareaInput label="Catatan" value={data.notes || ''} onChange={(event) => setData('notes', event.target.value)} error={errors.notes} />
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <PrimaryButton disabled={processing} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {editingId ? 'Simpan Fasilitas' : 'Tambah Fasilitas'}
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
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-950">Daftar Fasilitas</h3>
                    <div className="mt-3 space-y-2">
                        {facilities.map((facility) => (
                            <article key={facility.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-extrabold text-slate-900">{facility.name}</p>
                                        <p className="mt-0.5 truncate text-[11px] font-bold text-teal-700">
                                            {label(facility.category)} • {facility.location || '-'} • {facility.capacity || 0} orang
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 flex-col items-end gap-1">
                                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${availabilityTone[facility.availability_status] || 'bg-slate-100 text-slate-600'}`}>{label(facility.availability_status)}</span>
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${facility.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{facility.is_active ? 'Aktif' : 'Nonaktif'}</span>
                                    </div>
                                </div>
                                <div className="mt-2 grid gap-1 rounded-lg bg-slate-50 p-2 text-[11px] font-semibold text-slate-600 sm:grid-cols-2">
                                    <p className="truncate">Kondisi: {label(facility.condition)}</p>
                                    <p className="truncate">Booking: {facility.is_bookable ? 'Ya' : 'Tidak'}</p>
                                    <p className="truncate">Biaya: {money(facility.booking_fee)}</p>
                                    <p className="truncate">Total booking: {facility.bookings_count || 0}</p>
                                    <p className="truncate sm:col-span-2">PJ: {facility.responsible_person || '-'} {facility.responsible_phone ? `(${facility.responsible_phone})` : ''}</p>
                                </div>
                                <div className="mt-2 flex justify-end gap-2">
                                    <button className="rounded-lg bg-emerald-50 p-2 text-emerald-700" type="button" onClick={() => edit(facility)}>
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button className="rounded-lg bg-rose-50 p-2 text-rose-600" type="button" onClick={() => destroy(facility)}>
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </article>
                        ))}
                        {facilities.length === 0 && <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-center text-xs font-semibold text-slate-500">Belum ada data fasilitas.</p>}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
