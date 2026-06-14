<?php

use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\CommitteeMemberController;
use App\Http\Controllers\CongregantController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DonationCampaignController;
use App\Http\Controllers\DonationEntryController;
use App\Http\Controllers\DocumentArchiveController;
use App\Http\Controllers\FacilityBookingController;
use App\Http\Controllers\FinancialAccountController;
use App\Http\Controllers\FinancialCategoryController;
use App\Http\Controllers\FinancialTransactionController;
use App\Http\Controllers\InventoryItemController;
use App\Http\Controllers\InventoryMaintenanceController;
use App\Http\Controllers\MosqueProfileController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicPageController;
use App\Http\Controllers\PublicArticleController;
use App\Http\Controllers\QurbanParticipantController;
use App\Http\Controllers\ReportExportController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\UpdateGuideController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\WhatsappNotificationController;
use App\Http\Controllers\ZakatController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : app(PublicPageController::class)->home();
});
Route::get('agenda', [PublicPageController::class, 'agenda'])->name('public.agenda');
Route::get('artikel/{slug}', [PublicPageController::class, 'article'])->name('public.articles.show');
Route::get('laporan-keuangan', [PublicPageController::class, 'financeReport'])->name('public.finance-report');

Route::middleware('guest')->group(function (): void {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
});

Route::middleware('auth')->group(function (): void {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('profil-admin', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('profil-admin', [ProfileController::class, 'update'])->name('profile.update');

    Route::middleware('role:admin')->group(function (): void {
        Route::resource('users', UserManagementController::class)
            ->parameters(['users' => 'user'])
            ->names('users')
            ->except(['create', 'edit', 'show']);

        Route::get('update-aplikasi', UpdateGuideController::class)->name('updates.guide');
        Route::post('update-aplikasi/run', [UpdateGuideController::class, 'run'])->name('updates.run');
        Route::post('update-aplikasi/run-stream', [UpdateGuideController::class, 'stream'])->name('updates.stream');

        Route::get('backup-data', [BackupController::class, 'index'])->name('backups.index');
        Route::get('backup-data/download', [BackupController::class, 'download'])->name('backups.download');
        Route::post('backup-data/restore', [BackupController::class, 'restore'])->name('backups.restore');

        Route::get('audit-log', [ActivityLogController::class, 'index'])->name('activity-logs.index');
    });

    Route::middleware('role:admin,bendahara,viewer')->group(function (): void {
        Route::get('laporan/export', [ReportExportController::class, 'index'])->name('reports.export.index');
        Route::get('laporan/export/{report}', [ReportExportController::class, 'download'])->name('reports.export.download');
    });

    Route::middleware('role:admin,sekretaris')->group(function (): void {
        Route::get('profil-masjid', [MosqueProfileController::class, 'edit'])->name('mosque-profile.edit');
        Route::put('profil-masjid', [MosqueProfileController::class, 'update'])->name('mosque-profile.update');
    });

    Route::middleware('role:admin,sekretaris,takmir')->group(function (): void {
        Route::get('jadwal-sholat', function () {
            return Inertia\Inertia::render('PrayerSchedules/Index', [
                'profile' => \App\Models\MosqueProfile::first(),
            ]);
        })->name('prayer-schedules.index');

        Route::post('pengurus/urutkan', [CommitteeMemberController::class, 'reorder'])->name('committee-members.reorder');
        Route::resource('pengurus', CommitteeMemberController::class)
            ->parameters(['pengurus' => 'committeeMember'])
            ->names('committee-members')
            ->except(['create', 'edit', 'show']);

        Route::resource('jamaah', CongregantController::class)
            ->parameters(['jamaah' => 'congregant'])
            ->names('congregants')
            ->except(['create', 'edit', 'show']);

        Route::resource('pengumuman', AnnouncementController::class)
            ->parameters(['pengumuman' => 'announcement'])
            ->names('announcements')
            ->except(['create', 'edit', 'show']);

        Route::resource('artikel', PublicArticleController::class)
            ->parameters(['artikel' => 'article'])
            ->names('public-articles')
            ->except(['create', 'edit', 'show']);

        Route::resource('jadwal', ScheduleController::class)
            ->parameters(['jadwal' => 'schedule'])
            ->names('schedules')
            ->except(['create', 'edit', 'show']);

        Route::resource('arsip-surat', DocumentArchiveController::class)
            ->parameters(['arsip-surat' => 'documentArchive'])
            ->names('document-archives')
            ->except(['create', 'edit', 'show']);

        Route::resource('booking-fasilitas', FacilityBookingController::class)
            ->parameters(['booking-fasilitas' => 'facilityBooking'])
            ->names('facility-bookings')
            ->except(['create', 'edit', 'show']);

        Route::post('notifikasi-wa/{whatsappNotification}/terkirim', [WhatsappNotificationController::class, 'markSent'])
            ->name('whatsapp-notifications.mark-sent');
        Route::resource('notifikasi-wa', WhatsappNotificationController::class)
            ->parameters(['notifikasi-wa' => 'whatsappNotification'])
            ->names('whatsapp-notifications')
            ->except(['create', 'edit', 'show']);

        Route::resource('inventaris', InventoryItemController::class)
            ->parameters(['inventaris' => 'inventoryItem'])
            ->names('inventory')
            ->except(['create', 'edit', 'show']);

        Route::resource('perawatan-inventaris', InventoryMaintenanceController::class)
            ->parameters(['perawatan-inventaris' => 'inventoryMaintenance'])
            ->names('inventory-maintenances')
            ->except(['create', 'edit', 'show']);
    });

    Route::middleware('role:admin,bendahara')->group(function (): void {
        Route::post('donasi/catatan', [DonationEntryController::class, 'store'])->name('donations.entries.store');
        Route::delete('donasi/catatan/{donationEntry}', [DonationEntryController::class, 'destroy'])->name('donations.entries.destroy');
        Route::resource('donasi', DonationCampaignController::class)
            ->parameters(['donasi' => 'donationCampaign'])
            ->names('donations')
            ->except(['create', 'edit', 'show']);
    });

    Route::middleware('role:admin,bendahara,sekretaris,takmir')->group(function (): void {
        Route::get('zakat', [ZakatController::class, 'index'])->name('zakat.index');
        Route::post('zakat/penerimaan', [ZakatController::class, 'storeCollection'])->name('zakat.collections.store');
        Route::delete('zakat/penerimaan/{collection}', [ZakatController::class, 'destroyCollection'])->name('zakat.collections.destroy');
        Route::post('zakat/penyaluran', [ZakatController::class, 'storeDistribution'])->name('zakat.distributions.store');
        Route::delete('zakat/penyaluran/{distribution}', [ZakatController::class, 'destroyDistribution'])->name('zakat.distributions.destroy');

        Route::resource('qurban', QurbanParticipantController::class)
            ->parameters(['qurban' => 'qurbanParticipant'])
            ->names('qurban')
            ->except(['create', 'edit', 'show']);
    });

    Route::prefix('keuangan')->name('finance.')->middleware('role:admin,bendahara')->group(function (): void {
        Route::resource('akun', FinancialAccountController::class)
            ->parameters(['akun' => 'account'])
            ->names('accounts')
            ->except(['create', 'edit', 'show']);

        Route::resource('kategori', FinancialCategoryController::class)
            ->parameters(['kategori' => 'category'])
            ->names('categories')
            ->except(['create', 'edit', 'show']);

        Route::resource('transaksi', FinancialTransactionController::class)
            ->parameters(['transaksi' => 'transaction'])
            ->names('transactions')
            ->except(['create', 'edit', 'show']);
    });
});
