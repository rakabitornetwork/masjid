import { useForm } from '@inertiajs/react';
import { Camera, Save, ShieldCheck, UserRound } from 'lucide-react';
import { PrimaryButton, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';

export default function Edit({ profile }) {
    const { data, setData, post, processing, errors } = useForm({
        name: profile.name || '',
        email: profile.email || '',
        password: '',
        password_confirmation: '',
        avatar: null,
    });

    const previewUrl = data.avatar
        ? URL.createObjectURL(data.avatar)
        : profile.avatar_path
            ? `/storage/${profile.avatar_path}`
            : null;

    const submit = (event) => {
        event.preventDefault();
        post('/profil-admin', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setData('password', '');
                setData('password_confirmation', '');
                setData('avatar', null);
            },
        });
    };

    return (
        <AppLayout title="Profil Admin">
            <form onSubmit={submit} className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
                <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-700">Avatar Admin</p>
                    <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-5 text-center">
                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-white bg-white shadow-sm">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Avatar admin" className="h-full w-full object-cover" />
                            ) : (
                                <UserRound className="h-10 w-10 text-teal-600" />
                            )}
                        </div>
                        <label className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-teal-700">
                            <Camera className="h-4 w-4" />
                            Pilih Avatar
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(event) => setData('avatar', event.target.files?.[0] || null)}
                            />
                        </label>
                        {errors.avatar && <p className="mt-2 text-[10px] font-semibold text-rose-600">{errors.avatar}</p>}
                        <p className="mt-3 text-[10px] font-semibold leading-5 text-slate-500">
                            Gunakan gambar JPG/PNG maksimal 2MB. Avatar akan tampil di sidebar.
                        </p>
                    </div>
                </section>

                <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2.5">
                        <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">Akun Administrator</p>
                            <h3 className="text-sm font-extrabold text-slate-950">Ubah nama, email, dan password</h3>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <TextInput label="Nama Admin" value={data.name} onChange={(event) => setData('name', event.target.value)} error={errors.name} />
                        <TextInput label="Email Admin" type="email" value={data.email} onChange={(event) => setData('email', event.target.value)} error={errors.email} />
                        <TextInput
                            label="Password Baru"
                            type="password"
                            value={data.password}
                            onChange={(event) => setData('password', event.target.value)}
                            error={errors.password}
                            placeholder="Kosongkan jika tidak diganti"
                        />
                        <TextInput
                            label="Konfirmasi Password"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(event) => setData('password_confirmation', event.target.value)}
                            error={errors.password_confirmation}
                            placeholder="Ulangi password baru"
                        />
                    </div>

                    <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-3 text-[11px] font-semibold leading-5 text-amber-800">
                        Setelah email atau password diganti, gunakan data baru untuk login berikutnya.
                    </div>

                    <div className="mt-4 flex justify-end">
                        <PrimaryButton disabled={processing} className="gap-1.5">
                            <Save className="h-4 w-4" />
                            Simpan Profil Admin
                        </PrimaryButton>
                    </div>
                </section>
            </form>
        </AppLayout>
    );
}
