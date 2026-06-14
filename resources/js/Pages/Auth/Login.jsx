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
                <section className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-2xl shadow-emerald-950/15 backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="relative hidden min-h-[620px] overflow-hidden bg-gradient-to-br from-emerald-700 via-teal-600 to-amber-500 p-10 text-white lg:block">
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute left-10 top-16 h-40 w-40 rounded-full border border-white" />
                            <div className="absolute bottom-16 right-12 h-56 w-56 rounded-full border border-white" />
                        </div>
                        <div className="relative z-10 flex h-full flex-col justify-between">
                            <div>
                                <ApplicationLogo className="h-14 w-14" />
                                <p className="mt-8 text-sm font-bold uppercase tracking-[0.3em] text-emerald-100">
                                    High Density Premium Masjid
                                </p>
                                <h1 className="mt-4 max-w-lg text-5xl font-black leading-tight">
                                    Pusat kendali operasional masjid yang rapi, cepat, dan cerah.
                                </h1>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {['Keuangan', 'Jadwal', 'Pengurus'].map((item) => (
                                    <div key={item} className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                                        <ShieldCheck className="h-5 w-5" />
                                        <p className="mt-3 text-sm font-bold">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-10">
                        <div className="mb-8 flex items-center gap-3 lg:hidden">
                            <ApplicationLogo />
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">Masjid</p>
                                <h1 className="text-lg font-black">Management</h1>
                            </div>
                        </div>

                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">Login Admin</p>
                        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Selamat datang kembali</h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Masuk untuk mengelola profil, jadwal, pengumuman, dan keuangan masjid.
                        </p>

                        <form onSubmit={submit} className="mt-8 space-y-5">
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-900">
                                <p className="font-bold">Akun awal</p>
                                <p className="mt-1">admin@masjid.com / 12345678</p>
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

                            <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(event) => setData('remember', event.target.checked)}
                                    className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                Ingat saya di perangkat ini
                            </label>

                            <PrimaryButton disabled={processing} className="w-full py-3">
                                Masuk Dashboard
                            </PrimaryButton>
                        </form>
                    </div>
                </section>
            </main>
        </>
    );
}
