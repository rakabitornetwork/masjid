<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\CommitteeMember;
use App\Models\Congregant;
use App\Models\DonationCampaign;
use App\Models\FinancialAccount;
use App\Models\FinancialCategory;
use App\Models\InventoryItem;
use App\Models\MosqueProfile;
use App\Models\QurbanParticipant;
use App\Models\Schedule;
use App\Models\User;
use App\Models\ZakatCollection;
use App\Models\ZakatDistribution;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::updateOrCreate([
            'email' => 'admin@masjid.com',
        ], [
            'name' => 'Administrator Masjid',
            'role' => 'admin',
            'password' => Hash::make('12345678'),
        ]);

        MosqueProfile::updateOrCreate([
            'id' => 1,
        ], [
            'name' => 'Masjid Al-Ikhlas',
            'tagline' => 'Makmur, transparan, dan melayani jamaah',
            'address' => 'Jl. Masjid Raya No. 1',
            'city' => 'Kota Setempat',
            'province' => 'Indonesia',
            'phone' => '0812-3456-7890',
            'email' => 'info@masjid.com',
            'vision' => 'Menjadi pusat ibadah, pendidikan, dan layanan sosial yang amanah.',
            'mission' => 'Memakmurkan masjid, meningkatkan pelayanan jamaah, dan menjaga transparansi keuangan.',
            'capacity' => 500,
            'facilities' => ['Ruang utama', 'Tempat wudhu', 'Sound system', 'Area parkir', 'TPA/TPQ'],
        ]);

        CommitteeMember::updateOrCreate(['name' => 'H. Ahmad Fauzi', 'position' => 'Ketua DKM'], [
            'phone' => '0812-0000-0001',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        CommitteeMember::updateOrCreate(['name' => 'Siti Aminah', 'position' => 'Bendahara'], [
            'phone' => '0812-0000-0002',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        Congregant::updateOrCreate(['name' => 'Ahmad Ridwan', 'phone' => '0812-1000-0001'], [
            'family_head' => 'Ahmad Ridwan',
            'gender' => 'male',
            'address' => 'Jl. Masjid Raya No. 12',
            'neighborhood' => 'RT 01/RW 02',
            'occupation' => 'Wiraswasta',
            'marital_status' => 'married',
            'is_active' => true,
        ]);

        Congregant::updateOrCreate(['name' => 'Nur Aisyah', 'phone' => '0812-1000-0002'], [
            'family_head' => 'Ahmad Ridwan',
            'gender' => 'female',
            'address' => 'Jl. Masjid Raya No. 12',
            'neighborhood' => 'RT 01/RW 02',
            'occupation' => 'Guru',
            'marital_status' => 'married',
            'is_active' => true,
        ]);

        InventoryItem::updateOrCreate(['name' => 'Sound System Utama'], [
            'category' => 'Elektronik',
            'quantity' => 1,
            'unit' => 'set',
            'condition' => 'good',
            'location' => 'Ruang Utama',
            'estimated_value' => 8500000,
            'maintenance_due_at' => now()->addMonths(2)->toDateString(),
            'is_active' => true,
        ]);

        InventoryItem::updateOrCreate(['name' => 'Karpet Shaf Jamaah'], [
            'category' => 'Perlengkapan Ibadah',
            'quantity' => 20,
            'unit' => 'roll',
            'condition' => 'good',
            'location' => 'Ruang Utama',
            'estimated_value' => 12000000,
            'is_active' => true,
        ]);

        $renovationCampaign = DonationCampaign::updateOrCreate(['title' => 'Infaq Renovasi Tempat Wudhu'], [
            'category' => 'renovasi',
            'description' => 'Penggalangan dana untuk memperbaiki area tempat wudhu agar lebih nyaman bagi jamaah.',
            'target_amount' => 25000000,
            'start_date' => now()->toDateString(),
            'status' => 'active',
            'is_featured' => true,
        ]);

        $renovationCampaign->entries()->updateOrCreate([
            'donor_name' => 'Hamba Allah',
            'amount' => 1500000,
        ], [
            'payment_method' => 'transfer',
            'donated_at' => now()->toDateString(),
            'status' => 'confirmed',
        ]);

        ZakatCollection::updateOrCreate(['muzakki_name' => 'Keluarga Ahmad Ridwan', 'received_at' => now()->toDateString()], [
            'type' => 'fitrah',
            'money_amount' => 180000,
            'rice_amount' => 0,
            'payment_method' => 'cash',
            'status' => 'received',
        ]);

        ZakatDistribution::updateOrCreate(['mustahik_name' => 'Keluarga Bapak Hasan', 'distributed_at' => now()->toDateString()], [
            'mustahik_category' => 'fakir_miskin',
            'money_amount' => 150000,
            'rice_amount' => 5,
            'status' => 'distributed',
            'address' => 'Lingkungan sekitar masjid',
        ]);

        QurbanParticipant::updateOrCreate(['participant_name' => 'H. Ahmad Fauzi', 'registered_at' => now()->toDateString()], [
            'phone' => '0812-2000-0001',
            'animal_type' => 'cow',
            'share_count' => 1,
            'group_name' => 'Sapi A',
            'amount_paid' => 3500000,
            'target_amount' => 3500000,
            'payment_status' => 'paid',
            'slaughter_status' => 'registered',
        ]);

        $cashAccount = FinancialAccount::updateOrCreate(['name' => 'Kas Tunai Masjid'], [
            'type' => 'cash',
            'opening_balance' => 1000000,
            'is_active' => true,
        ]);

        FinancialAccount::updateOrCreate(['name' => 'Rekening Operasional'], [
            'type' => 'bank',
            'bank_name' => 'Bank Syariah Indonesia',
            'account_number' => '1234567890',
            'account_holder' => 'DKM Masjid Al-Ikhlas',
            'opening_balance' => 5000000,
            'is_active' => true,
        ]);

        $infaqCategory = FinancialCategory::updateOrCreate(['name' => 'Infaq Jamaah', 'type' => 'income'], [
            'color' => 'emerald',
            'icon' => 'hand-coins',
            'description' => 'Pemasukan infaq harian, Jumat, dan kotak amal.',
            'is_active' => true,
        ]);

        FinancialCategory::updateOrCreate(['name' => 'Donasi Kegiatan', 'type' => 'income'], [
            'color' => 'sky',
            'icon' => 'heart-handshake',
            'is_active' => true,
        ]);

        $operationalCategory = FinancialCategory::updateOrCreate(['name' => 'Operasional Masjid', 'type' => 'expense'], [
            'color' => 'rose',
            'icon' => 'receipt',
            'description' => 'Listrik, air, kebersihan, konsumsi, dan kebutuhan harian.',
            'is_active' => true,
        ]);

        $cashAccount->transactions()->updateOrCreate([
            'description' => 'Saldo awal infaq Jumat',
            'transaction_date' => now()->toDateString(),
        ], [
            'financial_category_id' => $infaqCategory->id,
            'recorded_by' => $admin->id,
            'type' => 'income',
            'amount' => 750000,
            'payment_method' => 'cash',
            'status' => 'posted',
        ]);

        $cashAccount->transactions()->updateOrCreate([
            'description' => 'Pembelian perlengkapan kebersihan',
            'transaction_date' => now()->toDateString(),
        ], [
            'financial_category_id' => $operationalCategory->id,
            'recorded_by' => $admin->id,
            'type' => 'expense',
            'amount' => 175000,
            'payment_method' => 'cash',
            'status' => 'posted',
        ]);

        Schedule::updateOrCreate([
            'title' => 'Shalat Jumat Pekan Ini',
            'date' => now()->next('Friday')->toDateString(),
        ], [
            'type' => 'friday_prayer',
            'start_time' => '11:45',
            'end_time' => '13:00',
            'location' => 'Ruang Utama Masjid',
            'imam' => 'Ust. Muhammad Hanif',
            'khatib' => 'Ust. Muhammad Hanif',
            'muadzin' => 'Ahmad Ridwan',
            'status' => 'scheduled',
        ]);

        Announcement::updateOrCreate([
            'title' => 'Selamat Datang di Sistem Manajemen Masjid',
        ], [
            'category' => 'umum',
            'body' => 'Dashboard awal sudah siap digunakan untuk mengelola profil, pengurus, jadwal, pengumuman, dan keuangan masjid.',
            'published_at' => now(),
            'is_pinned' => true,
            'status' => 'published',
        ]);
    }
}
