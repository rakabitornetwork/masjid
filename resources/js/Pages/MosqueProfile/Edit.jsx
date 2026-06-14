import { useForm } from '@inertiajs/react';
import { Building2, Save } from 'lucide-react';
import { PrimaryButton, TextareaInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';

export default function Edit({ profile, facilitiesText }) {
    const { data, setData, put, processing, errors } = useForm({
        name: profile?.name || 'Masjid Al-Ikhlas',
        tagline: profile?.tagline || '',
        address: profile?.address || '',
        city: profile?.city || '',
        province: profile?.province || '',
        postal_code: profile?.postal_code || '',
        phone: profile?.phone || '',
        email: profile?.email || '',
        website: profile?.website || '',
        bank_name: profile?.bank_name || '',
        bank_account_number: profile?.bank_account_number || '',
        bank_account_holder: profile?.bank_account_holder || '',
        vision: profile?.vision || '',
        mission: profile?.mission || '',
        founded_at: profile?.founded_at?.slice(0, 10) || '',
        capacity: profile?.capacity || '',
        facilities_text: facilitiesText || '',
    });

    const submit = (event) => {
        event.preventDefault();
        put('/profil-masjid');
    };

    return (
        <AppLayout title="Profil Masjid">
            <form onSubmit={submit} className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
                <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2.5">
                        <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                            <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">Identitas</p>
                            <h3 className="text-sm font-extrabold text-slate-950">Data Utama Masjid</h3>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <TextInput label="Nama Masjid" value={data.name} onChange={(event) => setData('name', event.target.value)} error={errors.name} />
                        <TextInput
                            label="Tagline"
                            value={data.tagline}
                            onChange={(event) => setData('tagline', event.target.value)}
                            error={errors.tagline}
                        />
                        <TextInput label="Kota" value={data.city} onChange={(event) => setData('city', event.target.value)} error={errors.city} />
                        <TextInput
                            label="Provinsi"
                            value={data.province}
                            onChange={(event) => setData('province', event.target.value)}
                            error={errors.province}
                        />
                        <TextInput
                            label="Kode Pos"
                            value={data.postal_code}
                            onChange={(event) => setData('postal_code', event.target.value)}
                            error={errors.postal_code}
                        />
                        <TextInput
                            label="Kapasitas Jamaah"
                            type="number"
                            value={data.capacity}
                            onChange={(event) => setData('capacity', event.target.value)}
                            error={errors.capacity}
                        />
                        <TextInput
                            label="Tanggal Berdiri"
                            type="date"
                            value={data.founded_at}
                            onChange={(event) => setData('founded_at', event.target.value)}
                            error={errors.founded_at}
                        />
                        <TextInput label="Website" value={data.website} onChange={(event) => setData('website', event.target.value)} error={errors.website} />
                        <div className="md:col-span-2">
                            <TextareaInput
                                label="Alamat Lengkap"
                                value={data.address}
                                onChange={(event) => setData('address', event.target.value)}
                                error={errors.address}
                            />
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                        <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-950">Kontak & Rekening</h3>
                        <div className="mt-3 grid gap-3">
                            <TextInput label="Telepon" value={data.phone} onChange={(event) => setData('phone', event.target.value)} error={errors.phone} />
                            <TextInput label="Email" value={data.email} onChange={(event) => setData('email', event.target.value)} error={errors.email} />
                            <TextInput
                                label="Nama Bank"
                                value={data.bank_name}
                                onChange={(event) => setData('bank_name', event.target.value)}
                                error={errors.bank_name}
                            />
                            <TextInput
                                label="Nomor Rekening"
                                value={data.bank_account_number}
                                onChange={(event) => setData('bank_account_number', event.target.value)}
                                error={errors.bank_account_number}
                            />
                            <TextInput
                                label="Atas Nama"
                                value={data.bank_account_holder}
                                onChange={(event) => setData('bank_account_holder', event.target.value)}
                                error={errors.bank_account_holder}
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                        <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-950">Visi, Misi, Fasilitas</h3>
                        <div className="mt-3 grid gap-3">
                            <TextareaInput label="Visi" value={data.vision} onChange={(event) => setData('vision', event.target.value)} error={errors.vision} />
                            <TextareaInput label="Misi" value={data.mission} onChange={(event) => setData('mission', event.target.value)} error={errors.mission} />
                            <TextareaInput
                                label="Fasilitas (pisahkan koma)"
                                value={data.facilities_text}
                                onChange={(event) => setData('facilities_text', event.target.value)}
                                error={errors.facilities_text}
                            />
                        </div>
                    </div>

                    <PrimaryButton disabled={processing} className="w-full gap-2 py-3">
                        <Save className="h-4 w-4" />
                        Simpan Profil Masjid
                    </PrimaryButton>
                </section>
            </form>
        </AppLayout>
    );
}
