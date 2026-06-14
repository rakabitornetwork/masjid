# Aplikasi Manajemen Masjid

Aplikasi Manajemen Masjid adalah sistem admin berbasis web untuk membantu pengurus masjid mengelola profil masjid, kepengurusan, jadwal ibadah dan kegiatan, pengumuman, serta keuangan dasar secara terpusat.

Project ini dibuat untuk satu masjid per instalasi dan dirancang agar mudah dipasang di VPS Laravel standar. Build frontend dilakukan di komputer lokal/Laragon, lalu hasil build di `public/build` ikut dikirim ke GitHub sehingga VPS tidak wajib memiliki npm.

## Stack Teknologi

- Backend: Laravel 13, PHP 8.3+, Eloquent ORM, session authentication.
- Frontend: Inertia.js, React, Tailwind CSS v4, Vite.
- Icon UI: `lucide-react` dan SVG custom ringan untuk logo masjid.
- Database: mengikuti konfigurasi Laravel di `.env`, misalnya MySQL/MariaDB.
- Asset production: hasil `npm run build` berada di `public/build`.
- Optimasi frontend: halaman Inertia dimuat lazy/dynamic import sehingga bundle awal lebih kecil dan halaman lain dipisah menjadi chunk tersendiri.

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
- Logo/icon aplikasi untuk sidebar, navbar, login, dan favicon.
- Visi, misi, tanggal berdiri, kapasitas jamaah, dan fasilitas.

### Kepengurusan

- Data pengurus/takmir/DKM.
- Jabatan, kontak, email, periode jabatan, urutan tampil, status aktif/nonaktif.
- Tambah, ubah, dan hapus data pengurus.

### Jamaah dan Keluarga

- Data jamaah dengan nama, kepala keluarga, jenis kelamin, tanggal lahir, kontak, alamat, RT/RW, pekerjaan, status nikah, status aktif, dan catatan.
- Manajemen keluarga jamaah dengan kepala keluarga, nomor WA, alamat, RT/RW, segmentasi ekonomi/layanan, status aktif, dan catatan.
- Jamaah dapat ditautkan ke keluarga sehingga data anggota keluarga lebih mudah dikelola.
- Data jamaah dan keluarga ikut masuk ke export laporan dan backup data aplikasi.

### Pengumuman

- Judul, kategori, isi pengumuman.
- Status `draft`, `published`, dan `archived`.
- Tanggal publikasi dan tanggal kedaluwarsa.
- Pin pengumuman penting di dashboard.
- Tambah, ubah, dan hapus pengumuman.

### Artikel Publik

- CRUD berita dan artikel publik untuk landing page masjid.
- Slug URL otomatis, kategori, ringkasan, isi artikel, cover image, status, tanggal publikasi, dan artikel unggulan.
- Artikel `published` tampil di landing page publik dan punya halaman detail `/artikel/{slug}`.
- Artikel publik ikut masuk ke export laporan dan backup data aplikasi.

### Jadwal Ibadah dan Kegiatan

- Jadwal Shalat Jumat, kajian, kegiatan, Ramadhan, Idul Fitri/Adha, dan layanan masjid.
- Tanggal, jam mulai, jam selesai, lokasi.
- Pembicara, imam, khatib, dan muadzin.
- Status `scheduled`, `done`, dan `canceled`.
- Tambah, ubah, dan hapus jadwal.

### Agenda Publik

- Halaman publik `/agenda` untuk menampilkan semua jadwal ibadah dan kegiatan mendatang.
- Ringkasan total agenda, agenda 7 hari ke depan, dan jumlah agenda Shalat Jumat.
- Tautan agenda tersedia dari header publik dan panel Jadwal Kegiatan di landing page.

### Arsip Surat dan Dokumen

- Pencatatan surat masuk, surat keluar, dokumen internal, dan dokumen lainnya.
- Nomor surat, tanggal dokumen, pengirim, penerima, kategori, status, dan catatan.
- Upload lampiran dokumen PDF, Word, Excel, JPG, atau PNG.
- Arsip surat ikut masuk ke export laporan dan backup data aplikasi.

### Booking Fasilitas

- Pencatatan booking aula, ruang kajian, sound system, dan fasilitas masjid lainnya.
- Data pemohon, nomor WA, nama kegiatan, tanggal, jam mulai, jam selesai, keperluan, status, dan catatan admin.
- Booking dapat memilih database fasilitas agar nama fasilitas konsisten dan relasinya tersimpan.
- Validasi bentrok jadwal untuk fasilitas yang sama pada tanggal dan jam yang tumpang tindih.
- Booking fasilitas ikut masuk ke export laporan dan backup data aplikasi.

### Data Fasilitas

- Pencatatan ruangan, aula, area, peralatan, kendaraan, parkir, halaman, layanan, dan fasilitas lain milik masjid.
- Data kategori, lokasi, kapasitas, kondisi, ketersediaan, biaya booking, penanggung jawab, nomor WA, status bisa booking, status aktif, dan catatan.
- Fasilitas yang aktif dan bisa dibooking tampil sebagai pilihan di form Booking Fasilitas.
- Data fasilitas ikut masuk ke export laporan dan backup data aplikasi.

### Perawatan Inventaris

- Pencatatan riwayat perawatan, inspeksi, perbaikan, pembersihan, dan servis barang inventaris.
- Data tanggal perawatan, jenis, penanggung jawab, biaya, status, catatan, dan jadwal perawatan berikutnya.
- Jadwal perawatan berikutnya dapat otomatis memperbarui `maintenance_due_at` pada barang inventaris.
- Riwayat perawatan ikut masuk ke export laporan dan backup data aplikasi.

### Notifikasi WhatsApp

- Pencatatan pesan WhatsApp untuk jadwal, booking, donasi, zakat, qurban, keuangan, dan pengumuman.
- Tombol `Manual` membuka WhatsApp/WhatsApp Web melalui link `wa.me` dengan isi pesan otomatis.
- Tombol `API` dapat mengirim pesan otomatis melalui provider yang dipilih di `.env`: Meta WhatsApp Cloud API atau Baileys Gateway Masjid.
- Admin tetap dapat menandai pesan sebagai terkirim setelah proses kirim manual dilakukan.
- Notifikasi WhatsApp ikut masuk ke export laporan dan backup data aplikasi.

Konfigurasi Meta WhatsApp Cloud API di `.env`:

```env
WHATSAPP_API_ENABLED=true
WHATSAPP_PROVIDER=meta
WHATSAPP_API_URL=https://graph.facebook.com
WHATSAPP_API_VERSION=v20.0
WHATSAPP_PHONE_NUMBER_ID=isi_phone_number_id_meta
WHATSAPP_ACCESS_TOKEN=isi_access_token_meta
```

Konfigurasi Baileys Gateway Masjid di `.env`:

```env
WHATSAPP_API_ENABLED=true
WHATSAPP_PROVIDER=baileys
BAILEYS_BASE_URL=http://127.0.0.1:3002
BAILEYS_TOKEN=isi_token_gateway_masjid
BAILEYS_TIMEOUT=20
BAILEYS_WAIT_DELIVERY=true
```

Install gateway di VPS:

```bash
cd /home/masjid/public_html/baileys-gateway
npm install
cp .env.example .env
npm run pm2:start
pm2 save
curl http://127.0.0.1:3002/health
```

Gateway masjid memakai port `3002`, process PM2 `masjid-baileys-gateway`, dan session folder `.baileys_masjid_auth` agar tidak bentrok dengan gateway aplikasi lain.

Setelah mengubah `.env` di VPS, jalankan:

```bash
php artisan optimize:clear
php artisan config:cache
```

### Zakat dan Database Muzakki/Mustahik

- Pencatatan penerimaan zakat fitrah, zakat maal, fidyah, dan infaq zakat.
- Pencatatan penyaluran zakat untuk mustahik dengan nominal uang, beras, jadwal, status, dan catatan.
- Database master Muzakki & Mustahik menyimpan nama, nomor WA, identitas, alamat, jumlah keluarga, tipe muzakki, kategori mustahik, pekerjaan, penghasilan, status aktif, dan catatan.
- Form penerimaan dan penyaluran zakat dapat memilih database Muzakki/Mustahik agar data nama, nomor WA, kategori, dan alamat otomatis terisi serta relasinya tersimpan.
- Data zakat dan database Muzakki & Mustahik ikut masuk ke export laporan dan backup data aplikasi.

### Sedekah Khusus

- Pencatatan sedekah khusus seperti Sedekah Subuh, Sedekah Jumat, yatim/piatu, iftar, pendidikan, kesehatan, sosial, dan operasional masjid.
- Data donatur, nomor WA, kategori, tujuan khusus, nominal, metode pembayaran, tanggal, status, anonim, dan catatan.
- Ringkasan total terkumpul, total bulan ini, jumlah donatur, dan sedekah pending.
- Sedekah khusus ikut masuk ke export laporan dan backup data aplikasi.

### Manajemen Wakaf

- Pencatatan wakif, kontak, aset wakaf, kategori, deskripsi, nilai estimasi, tanggal terima, nomor sertifikat, lokasi, status, dan catatan.
- Mendukung wakaf uang, tanah, bangunan, peralatan, kendaraan, kitab/buku, dan aset lainnya.
- Ringkasan total wakaf, aset dikelola, aset produktif, dan nilai estimasi.
- Data wakaf ikut masuk ke export laporan dan backup data aplikasi.

### Program Sosial

- Pencatatan program bantuan sosial seperti santunan dhuafa, yatim/piatu, pendidikan, kesehatan, bencana, Ramadhan, dan lainnya.
- Data penerima manfaat, nomor WA, alamat, nominal bantuan, bantuan barang/paket, tanggal distribusi, status, dan catatan.
- Ringkasan total program, rencana bantuan, bantuan tersalurkan, dan total nominal.
- Program sosial ikut masuk ke export laporan dan backup data aplikasi.

### Keuangan Dasar

- Akun kas, bank, QRIS, dan e-wallet.
- Kategori pemasukan dan pengeluaran.
- Transaksi pemasukan dan pengeluaran.
- Metode pembayaran tunai, transfer, QRIS, dan e-wallet.
- Status transaksi `draft` dan `posted`.
- Ringkasan total pemasukan, pengeluaran, dan saldo bersih.

### Export, Backup, dan Restore

- Export laporan CSV, Excel-compatible XLS, dan halaman cetak PDF untuk transaksi keuangan, jamaah, keluarga jamaah, inventaris, perawatan inventaris, data fasilitas, donasi, sedekah khusus, artikel, arsip surat, booking fasilitas, notifikasi WhatsApp, zakat, database muzakki/mustahik, qurban, wakaf, dan program sosial.
- Backup data aplikasi dari menu `Backup Data` dalam format JSON.
- Restore data aplikasi dari file backup JSON dengan konfirmasi manual `RESTORE`.
- Backup hanya menyertakan tabel aplikasi, bukan cache, session, job queue, atau tabel teknis Laravel.

### Audit Log Aktivitas

- Pencatatan otomatis untuk aktivitas tambah, ubah, hapus, restore, reorder, dan aksi update aplikasi.
- Pencatatan login dan logout user admin.
- Riwayat menampilkan user, route, path, IP address, browser, status HTTP, dan waktu aktivitas.
- Password dan file upload tidak disimpan mentah di metadata audit log.

### Tentang Aplikasi

- Halaman informasi aplikasi berisi nama aplikasi, versi, tema, developer, environment, stack teknologi, dan ringkasan fitur utama.
- Menu `Tentang Aplikasi` tersedia untuk semua user yang sudah login.

### User, Role, dan Permission

- Manajemen user admin dengan nama, email, nomor WA, role, dan password.
- Role bawaan: `admin`, `bendahara`, `sekretaris`, `takmir`, dan `viewer`.
- Hak akses bawaan mengikuti role, tetapi admin dapat mengaktifkan custom permission per user.
- Custom permission memungkinkan user tertentu diberi izin khusus tanpa mengubah role utamanya.

## Roadmap Fitur Lanjutan

Fitur berikut sudah direncanakan untuk pengembangan berikutnya:

- Laporan PDF/Excel untuk keuangan, kegiatan, jamaah, dan ZISWAF.

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

Jika folder `public_html` lama masih ada, backup dulu lalu clone repository GitHub ke `public_html`:

```bash
cd ~
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
php artisan view:cache
```

Jika folder `public_html` benar-benar kosong dan ingin langsung clone:

```bash
cd ~
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

Jika tombol `Jalankan Update` di aplikasi menampilkan error `php-fpm8.4 artisan`, berarti server memakai binary PHP-FPM, bukan PHP CLI. Tambahkan konfigurasi berikut di `.env` VPS:

```env
PHP_CLI_BINARY=php
```

Jika command `php` tidak tersedia di VPS, cari path PHP CLI:

```bash
which php
which php8.4
```

Lalu isi `.env` sesuai hasilnya, misalnya:

```env
PHP_CLI_BINARY=/usr/bin/php8.4
```

Pastikan document root web server mengarah ke folder:

```text
public
```

### Update Aplikasi Berikutnya

Jika aplikasi sudah berjalan di VPS dan hanya ingin mengambil perubahan terbaru dari GitHub:

```bash
cd ~/public_html
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
