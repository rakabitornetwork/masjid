import { AlertTriangle, CheckCircle2, ClipboardList, RefreshCw, Server } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';

const updateCommands = `cd ~/public_html
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache`;

const firstInstallCommands = `cd ~
mv public_html public_html_backup
git clone https://github.com/rakabitornetwork/masjid.git public_html
cd public_html
composer install --no-dev --optimize-autoloader
cp .env.example .env
php artisan key:generate
php artisan migrate --seed --force
php artisan storage:link
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache`;

export default function Update() {
    return (
        <AppLayout title="Update Aplikasi">
            <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
                <div className="space-y-4">
                    <InfoCard
                        icon={RefreshCw}
                        title="Update Dari GitHub"
                        body="Halaman ini berisi panduan update manual untuk VPS. Perintah update tidak dijalankan dari browser agar server tetap aman."
                        tone="emerald"
                    />
                    <InfoCard
                        icon={Server}
                        title="VPS Tanpa npm"
                        body="Pastikan build frontend sudah dilakukan di Laragon dan folder public/build ikut dipush ke GitHub."
                        tone="amber"
                    />
                    <InfoCard
                        icon={AlertTriangle}
                        title="Jangan Jalankan npm di VPS"
                        body="Jika VPS tidak memiliki npm, jangan menjalankan npm install atau npm run build di server."
                        tone="rose"
                    />
                </div>

                <div className="space-y-4">
                    <CommandPanel
                        title="Perintah Update Rutin di VPS"
                        description="Gunakan perintah ini jika aplikasi sudah pernah di-clone ke ~/public_html."
                        commands={updateCommands}
                    />
                    <CommandPanel
                        title="Setup Pertama di VPS"
                        description="Gunakan perintah ini jika folder public_html belum terhubung ke repository GitHub."
                        commands={firstInstallCommands}
                    />
                </div>
            </section>

            <section className="mt-4 rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-emerald-950/5">
                <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-950">Checklist Sebelum Update</h3>
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            {[
                                'Perubahan terbaru sudah dipush ke GitHub.',
                                'Folder public/build ikut masuk commit.',
                                '.env di VPS sudah berisi database production.',
                                'APP_DEBUG=false di VPS.',
                                'Permission storage dan bootstrap/cache bisa ditulis web server.',
                                'Backup database dibuat sebelum update besar.',
                            ].map((item) => (
                                <div key={item} className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white p-3 text-sm font-semibold text-slate-700">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}

function InfoCard({ icon: Icon, title, body, tone }) {
    const tones = {
        emerald: 'bg-emerald-100 text-emerald-700',
        amber: 'bg-amber-100 text-amber-700',
        rose: 'bg-rose-100 text-rose-700',
    };

    return (
        <article className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-emerald-950/5">
            <div className={`inline-flex rounded-2xl p-3 ${tones[tone]}`}>
                <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
        </article>
    );
}

function CommandPanel({ title, description, commands }) {
    return (
        <article className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-emerald-950/5">
            <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-slate-950 p-3 text-white">
                    <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-950">{title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{description}</p>
                </div>
            </div>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm leading-7 text-emerald-100">
                <code>{commands}</code>
            </pre>
        </article>
    );
}
