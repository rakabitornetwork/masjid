import { Head, useForm } from '@inertiajs/react';
import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import ApplicationLogo from '../../Components/ApplicationLogo';
import { PrimaryButton, TextInput } from '../../Components/FormControls';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: 'admin@masjid.com',
        password: '12345678',
        remember: true,
    });

    const submit = (event) => {
        event.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Login Admin" />

            <main className="flex min-h-screen items-center justify-center p-4">
                <section className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-2xl shadow-blue-950/15 backdrop-blur lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="relative hidden min-h-[520px] overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-sky-600 p-8 text-white lg:block">
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute left-10 top-16 h-40 w-40 rounded-full border border-white" />
                            <div className="absolute bottom-16 right-12 h-56 w-56 rounded-full border border-white" />
                        </div>
                        <div className="relative z-10 flex h-full flex-col justify-between">
                            <div>
                                <ApplicationLogo className="h-10 w-10" />
                                <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.24em] text-blue-100">
                                    High Density Premium Masjid
                                </p>
                                <h1 className="mt-3 max-w-md text-2xl font-extrabold leading-tight">
                                    Pusat kendali operasional masjid yang rapi, cepat, dan cerah.
                                </h1>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {['Keuangan', 'Jadwal', 'Pengurus'].map((item) => (
                                    <div key={item} className="rounded-xl bg-white/15 p-3 backdrop-blur">
                                        <ShieldCheck className="h-4 w-4" />
                                        <p className="mt-2 text-xs font-bold">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-7">
                        <div className="mb-8 flex items-center gap-3 lg:hidden">
                            <ApplicationLogo />
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">Masjid</p>
                                <h1 className="text-base font-black">Management</h1>
                            </div>
                        </div>

                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">Login Admin</p>
                        <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-950">Selamat datang kembali</h2>
                        <p className="mt-2 text-xs font-medium text-slate-500">
                            Masuk untuk mengelola profil, jadwal, pengumuman, dan keuangan masjid.
                        </p>

                        <form onSubmit={submit} className="mt-6 space-y-4">
                            <div className="rounded-lg border border-teal-100 bg-teal-50/70 p-3 text-xs font-semibold text-teal-900">
                                <p className="font-bold">Akun awal</p>
                                <p className="mt-0.5">admin@masjid.com / 12345678</p>
                            </div>

                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3 top-9 h-4 w-4 text-emerald-600" />
                                <TextInput
                                    label="Email Admin"
                                    type="email"
                                    value={data.email}
                                    onChange={(event) => setData('email', event.target.value)}
                                    error={errors.email}
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                            </div>

                            <div className="relative">
                                <LockKeyhole className="pointer-events-none absolute left-3 top-9 h-4 w-4 text-emerald-600" />
                                <TextInput
                                    label="Password"
                                    type="password"
                                    value={data.password}
                                    onChange={(event) => setData('password', event.target.value)}
                                    error={errors.password}
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                            </div>

                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(event) => setData('remember', event.target.checked)}
                                    className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                Ingat saya di perangkat ini
                            </label>

                            <PrimaryButton disabled={processing} className="w-full py-2">
                                Masuk Dashboard
                            </PrimaryButton>
                        </form>
                    </div>
                </section>
            </main>
        </>
    );
}
