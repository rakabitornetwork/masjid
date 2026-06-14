# Aplikasi Manajemen Masjid

Aplikasi Manajemen Masjid adalah sistem admin berbasis web untuk membantu pengurus masjid mengelola profil masjid, kepengurusan, jadwal ibadah dan kegiatan, pengumuman, serta keuangan dasar secara terpusat.

Project ini dibuat untuk satu masjid per instalasi dan dirancang agar mudah dipasang di VPS Laravel standar. Build frontend dilakukan di komputer lokal/Laragon, lalu hasil build di `public/build` ikut dikirim ke GitHub sehingga VPS tidak wajib memiliki npm.

## Stack Teknologi

- Backend: Laravel 13, PHP 8.3+, Eloquent ORM, session authentication.
- Frontend: Inertia.js, React, Tailwind CSS v4, Vite.
- Icon UI: `lucide-react` dan SVG custom ringan untuk logo masjid.
- Database: mengikuti konfigurasi Laravel di `.env`, misalnya MySQL/MariaDB.
- Asset production: hasil `npm run build` berada di `public/build`.

## Tema Desain

Aplikasi memakai tema High Density Premium Masjid dengan karakter:

- Warna cerah bernuansa emerald, teal, gold, amber, dan putih.
- Layout admin padat untuk banyak data dalam satu layar.
- Sidebar navigasi, topbar ringkas, kartu statistik compact, tabel data, dan form terstruktur.
- Dashboard berisi ringkasan operasional masjid yang cepat dibaca oleh admin/pengurus.

## Fitur Yang Sudah Tersedia

### Autentikasi Admin

- Login admin berbasis session Laravel.
- Logout aman dengan invalidasi session.
- Register publik tidak disediakan agar akses admin lebih terkendali.
- Data user membedakan role awal, seperti `admin` dan `pengurus`.

### Dashboard

- Ringkasan saldo total kas dan bank.
- Total pemasukan bulan berjalan.
- Total pengeluaran bulan berjalan.
- Jumlah pengurus aktif.
- Ringkasan profil masjid.
- Daftar akun kas/bank beserta saldo.
- Transaksi terbaru.
- Jadwal terdekat.
- Pengumuman terbaru dan pengumuman yang dipin.

### Profil Masjid

- Nama masjid dan tagline.
- Alamat, kota, provinsi, kode pos.
- Kontak telepon, email, dan website.
- Informasi rekening bank.
- Visi, misi, tanggal berdiri, kapasitas jamaah, dan fasilitas.

### Kepengurusan

- Data pengurus/takmir/DKM.
- Jabatan, kontak, email, periode jabatan, urutan tampil, status aktif/nonaktif.
- Tambah, ubah, dan hapus data pengurus.

### Pengumuman

- Judul, kategori, isi pengumuman.
- Status `draft`, `published`, dan `archived`.
- Tanggal publikasi dan tanggal kedaluwarsa.
- Pin pengumuman penting di dashboard.
- Tambah, ubah, dan hapus pengumuman.

### Jadwal Ibadah dan Kegiatan

- Jadwal Shalat Jumat, kajian, kegiatan, Ramadhan, Idul Fitri/Adha, dan layanan masjid.
- Tanggal, jam mulai, jam selesai, lokasi.
- Pembicara, imam, khatib, dan muadzin.
- Status `scheduled`, `done`, dan `canceled`.
- Tambah, ubah, dan hapus jadwal.

### Keuangan Dasar

- Akun kas, bank, QRIS, dan e-wallet.
- Kategori pemasukan dan pengeluaran.
- Transaksi pemasukan dan pengeluaran.
- Metode pembayaran tunai, transfer, QRIS, dan e-wallet.
- Status transaksi `draft` dan `posted`.
- Ringkasan total pemasukan, pengeluaran, dan saldo bersih.

## Roadmap Fitur Lanjutan

Fitur berikut sudah direncanakan untuk pengembangan berikutnya:

- Manajemen jamaah, keluarga, alamat RT/RW, dan segmentasi jamaah.
- ZISWAF: zakat fitrah, zakat mal, infaq, sedekah, wakaf, muzakki, mustahik, dan distribusi.
- Inventaris aset masjid, fasilitas, booking ruangan, dan riwayat perawatan.
- Surat masuk/keluar dan arsip dokumen.
- Laporan PDF/Excel untuk keuangan, kegiatan, jamaah, dan ZISWAF.
- Manajemen user, role, permission lebih detail, dan audit log.
- Landing page publik, berita, agenda publik, dan integrasi notifikasi.

## Akun Admin Awal

Seeder akan membuat akun admin awal berikut:

```text
Email: admin@masjid.com
Password: 12345678
```

Ganti password admin setelah login pertama di server produksi.

## Instalasi Lokal di Laragon

Jalankan perintah berikut di komputer lokal/Laragon:

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm run build
```

Untuk menjalankan development server:

```bash
composer run dev
```

Atau jalankan Laravel dan Vite secara terpisah:

```bash
php artisan serve
npm run dev
```

## Build Frontend

Jalankan build frontend di Laragon/lokal sebelum push ke GitHub:

```bash
npm run build
```

Hasil build akan masuk ke:

```text
public/build
```

Folder `public/build` memang harus ikut dipush ke GitHub karena VPS tidak menjalankan npm.

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

Pastikan document root web server mengarah ke folder:

```text
public
```

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

### Perintah Yang Tidak Perlu di VPS

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

## Validasi Project

Perintah yang dapat digunakan untuk mengecek aplikasi:

```bash
php artisan test
npm audit --audit-level=critical
npm run build
```

## Catatan Produksi

- Pastikan `.env` VPS tidak ikut dipush ke GitHub.
- Pastikan `APP_DEBUG=false` di server produksi.
- Pastikan permission folder `storage` dan `bootstrap/cache` dapat ditulis oleh web server.
- Jalankan `php artisan migrate --force` setiap ada perubahan database baru.
- Jalankan ulang `npm run build` di lokal setiap ada perubahan file React, CSS, Vite, atau asset frontend.
