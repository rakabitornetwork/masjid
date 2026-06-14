# masjid
Aplikasi manajement masjid

## Deployment ke VPS

Project ini memakai Laravel, Inertia.js, React, Tailwind CSS, dan Vite. Proses `npm run build` dilakukan di Laragon/lokal, lalu hasil build di folder `public/build` ikut dipush ke GitHub. Karena itu VPS tidak perlu menjalankan `npm install` atau `npm run build`.

### Setup Pertama di VPS

Jalankan perintah berikut di VPS setelah repository GitHub sudah tersedia:

```bash
cd /path/ke/project/masjid
git pull origin main
composer install --no-dev --optimize-autoloader
cp .env.example .env
php artisan key:generate
php artisan migrate --seed --force
php artisan storage:link
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Setelah itu sesuaikan konfigurasi database dan domain di file `.env`:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://domain-anda.com

DB_DATABASE=nama_database
DB_USERNAME=user_database
DB_PASSWORD=password_database
```

Akun admin awal:

```text
Email: admin@masjid.com
Password: 12345678
```

Ganti password admin setelah login pertama di server produksi.

### Update Aplikasi Berikutnya

Jika aplikasi sudah berjalan di VPS dan hanya ingin mengambil perubahan terbaru dari GitHub:

```bash
cd /path/ke/project/masjid
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Catatan Penting

Jangan jalankan perintah berikut di VPS jika server tidak memiliki npm:

```bash
npm install
npm run build
```

Build frontend cukup dilakukan di Laragon/lokal sebelum push ke GitHub:

```bash
npm install
npm run build
```
