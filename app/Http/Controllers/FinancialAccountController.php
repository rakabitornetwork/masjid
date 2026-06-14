<?php

namespace App\Http\Controllers;

use App\Models\FinancialAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinancialAccountController extends Controller
{
    public function index(): Response
    {
        $accounts = FinancialAccount::with('transactions')->orderBy('name')->get()->map(function (FinancialAccount $account) {
            $income = $account->transactions->where('type', 'income')->where('status', 'posted')->sum('amount');
            $expense = $account->transactions->where('type', 'expense')->where('status', 'posted')->sum('amount');

            return [
                ...$account->toArray(),
                'balance' => (float) $account->opening_balance + (float) $income - (float) $expense,
            ];
        });

        return Inertia::render('Finance/Accounts', [
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        FinancialAccount::create($this->validatedData($request));

        return back()->with('success', 'Akun kas/bank berhasil ditambahkan.');
    }

    public function update(Request $request, FinancialAccount $account): RedirectResponse
    {
        $account->update($this->validatedData($request));

        return back()->with('success', 'Akun kas/bank berhasil diperbarui.');
    }

    public function destroy(FinancialAccount $account): RedirectResponse
    {
        if ($account->transactions()->exists()) {
            return back()->with('error', 'Akun yang sudah memiliki transaksi tidak dapat dihapus.');
        }

        $account->delete();

        return back()->with('success', 'Akun kas/bank berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:cash,bank,e_wallet'],
            'bank_name' => ['nullable', 'string', 'max:100'],
            'account_number' => ['nullable', 'string', 'max:100'],
            'account_holder' => ['nullable', 'string', 'max:255'],
            'opening_balance' => ['required', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
            'notes' => ['nullable', 'string'],
        ]);
    }
}
