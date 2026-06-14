<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\DonationCampaign;
use App\Models\FinancialAccount;
use App\Models\FinancialTransaction;
use App\Models\MosqueProfile;
use App\Models\Schedule;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class PublicPageController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('Public/Home', [
            'profile' => Schema::hasTable('mosque_profiles') ? MosqueProfile::first() : null,
            'announcements' => Schema::hasTable('announcements') ? Announcement::query()
                ->where('status', 'published')
                ->where(function ($query): void {
                    $query->whereNull('expires_at')->orWhereDate('expires_at', '>=', now());
                })
                ->orderByDesc('is_pinned')
                ->latest('published_at')
                ->limit(4)
                ->get() : [],
            'upcomingSchedules' => Schema::hasTable('schedules') ? Schedule::query()
                ->whereDate('date', '>=', now())
                ->orderBy('date')
                ->orderBy('start_time')
                ->limit(4)
                ->get() : [],
            'publicAccounts' => Schema::hasTable('financial_accounts') ? FinancialAccount::where('is_active', true)
                ->whereIn('type', ['bank', 'qris', 'e_wallet'])
                ->orderBy('name')
                ->get() : [],
            'donationCampaigns' => Schema::hasTable('donation_campaigns') && Schema::hasTable('donation_entries')
                ? DonationCampaign::with('entries')
                    ->where('status', 'active')
                    ->where('is_featured', true)
                    ->latest()
                    ->limit(3)
                    ->get()
                : [],
            'summary' => $this->financialSummary(),
        ]);
    }

    public function financeReport(): Response
    {
        return Inertia::render('Public/FinanceReport', [
            'profile' => Schema::hasTable('mosque_profiles') ? MosqueProfile::first() : null,
            'accounts' => Schema::hasTable('financial_accounts') && Schema::hasTable('financial_transactions')
                ? FinancialAccount::with('transactions')->where('is_active', true)->orderBy('name')->get()->map(function (FinancialAccount $account) {
                $income = $account->transactions->where('type', 'income')->where('status', 'posted')->sum('amount');
                $expense = $account->transactions->where('type', 'expense')->where('status', 'posted')->sum('amount');

                return [
                    'id' => $account->id,
                    'name' => $account->name,
                    'type' => $account->type,
                    'balance' => (float) $account->opening_balance + (float) $income - (float) $expense,
                ];
            }) : [],
            'transactions' => Schema::hasTable('financial_transactions') ? FinancialTransaction::with(['account', 'category'])
                ->where('status', 'posted')
                ->latest('transaction_date')
                ->latest()
                ->limit(20)
                ->get() : [],
            'summary' => $this->financialSummary(),
        ]);
    }

    /**
     * @return array<string, float>
     */
    private function financialSummary(): array
    {
        if (! Schema::hasTable('financial_transactions')) {
            return [
                'income' => 0,
                'expense' => 0,
                'balance' => 0,
            ];
        }

        $income = (float) FinancialTransaction::where('type', 'income')->where('status', 'posted')->sum('amount');
        $expense = (float) FinancialTransaction::where('type', 'expense')->where('status', 'posted')->sum('amount');
        $openingBalance = Schema::hasTable('financial_accounts') ? (float) FinancialAccount::sum('opening_balance') : 0;

        return [
            'income' => $income,
            'expense' => $expense,
            'balance' => $openingBalance + $income - $expense,
        ];
    }
}
