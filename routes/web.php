<?php

use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\CommitteeMemberController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FinancialAccountController;
use App\Http\Controllers\FinancialCategoryController;
use App\Http\Controllers\FinancialTransactionController;
use App\Http\Controllers\MosqueProfileController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\UpdateGuideController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : view('welcome');
});

Route::middleware('guest')->group(function (): void {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
});

Route::middleware('auth')->group(function (): void {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('profil-admin', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('profil-admin', [ProfileController::class, 'update'])->name('profile.update');
    Route::get('update-aplikasi', UpdateGuideController::class)->name('updates.guide');
    Route::post('update-aplikasi/run', [UpdateGuideController::class, 'run'])->name('updates.run');
    Route::post('update-aplikasi/run-stream', [UpdateGuideController::class, 'stream'])->name('updates.stream');

    Route::get('profil-masjid', [MosqueProfileController::class, 'edit'])->name('mosque-profile.edit');
    Route::put('profil-masjid', [MosqueProfileController::class, 'update'])->name('mosque-profile.update');

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

    Route::resource('pengumuman', AnnouncementController::class)
        ->parameters(['pengumuman' => 'announcement'])
        ->names('announcements')
        ->except(['create', 'edit', 'show']);

    Route::resource('jadwal', ScheduleController::class)
        ->parameters(['jadwal' => 'schedule'])
        ->names('schedules')
        ->except(['create', 'edit', 'show']);

    Route::prefix('keuangan')->name('finance.')->group(function (): void {
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
