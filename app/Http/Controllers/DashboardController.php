<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\CommitteeMember;
use App\Models\FinancialAccount;
use App\Models\FinancialTransaction;
use App\Models\MosqueProfile;
use App\Models\Schedule;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $monthStart = Carbon::now()->startOfMonth();
        $monthEnd = Carbon::now()->endOfMonth();

        $incomeTotal = FinancialTransaction::where('type', 'income')->where('status', 'posted')->sum('amount');
        $expenseTotal = FinancialTransaction::where('type', 'expense')->where('status', 'posted')->sum('amount');
        $openingBalance = FinancialAccount::sum('opening_balance');

        $monthlyIncome = FinancialTransaction::where('type', 'income')
            ->where('status', 'posted')
            ->whereBetween('transaction_date', [$monthStart, $monthEnd])
            ->sum('amount');

        $monthlyExpense = FinancialTransaction::where('type', 'expense')
            ->where('status', 'posted')
            ->whereBetween('transaction_date', [$monthStart, $monthEnd])
            ->sum('amount');

        $accounts = FinancialAccount::with('transactions')->orderBy('name')->get()->map(function (FinancialAccount $account) {
            $income = $account->transactions->where('type', 'income')->where('status', 'posted')->sum('amount');
            $expense = $account->transactions->where('type', 'expense')->where('status', 'posted')->sum('amount');

            return [
                'id' => $account->id,
                'name' => $account->name,
                'type' => $account->type,
                'balance' => (float) $account->opening_balance + (float) $income - (float) $expense,
            ];
        });

        return Inertia::render('Dashboard/Index', [
            'profile' => MosqueProfile::first(),
            'stats' => [
                'balance' => (float) $openingBalance + (float) $incomeTotal - (float) $expenseTotal,
                'monthly_income' => (float) $monthlyIncome,
                'monthly_expense' => (float) $monthlyExpense,
                'active_committee' => CommitteeMember::where('is_active', true)->count(),
                'published_announcements' => Announcement::where('status', 'published')->count(),
                'upcoming_schedules' => Schedule::whereDate('date', '>=', now()->toDateString())->count(),
            ],
            'accounts' => $accounts,
            'recentTransactions' => FinancialTransaction::with(['account', 'category'])
                ->latest('transaction_date')
                ->latest()
                ->limit(6)
                ->get(),
            'upcomingSchedules' => Schedule::whereDate('date', '>=', now()->toDateString())
                ->orderBy('date')
                ->orderBy('start_time')
                ->limit(6)
                ->get(),
            'announcements' => Announcement::where('status', 'published')
                ->orderByDesc('is_pinned')
                ->latest('published_at')
                ->limit(5)
                ->get(),
        ]);
    }
}
