<?php

namespace App\Http\Controllers;

use App\Models\FinancialAccount;
use App\Models\FinancialCategory;
use App\Models\FinancialTransaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FinancialTransactionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Finance/Transactions', [
            'transactions' => FinancialTransaction::with(['account', 'category', 'recorder'])
                ->latest('transaction_date')
                ->latest()
                ->get(),
            'accounts' => FinancialAccount::where('is_active', true)->orderBy('name')->get(),
            'categories' => FinancialCategory::where('is_active', true)->orderBy('type')->orderBy('name')->get(),
            'summary' => [
                'income' => (float) FinancialTransaction::where('type', 'income')->where('status', 'posted')->sum('amount'),
                'expense' => (float) FinancialTransaction::where('type', 'expense')->where('status', 'posted')->sum('amount'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        FinancialTransaction::create([
            ...$this->validatedData($request),
            'recorded_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Transaksi berhasil ditambahkan.');
    }

    public function update(Request $request, FinancialTransaction $transaction): RedirectResponse
    {
        $transaction->update($this->validatedData($request));

        return back()->with('success', 'Transaksi berhasil diperbarui.');
    }

    public function destroy(FinancialTransaction $transaction): RedirectResponse
    {
        $transaction->delete();

        return back()->with('success', 'Transaksi berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request): array
    {
        return $request->validate([
            'financial_account_id' => ['required', Rule::exists('financial_accounts', 'id')],
            'financial_category_id' => ['required', Rule::exists('financial_categories', 'id')],
            'type' => ['required', 'in:income,expense'],
            'transaction_date' => ['required', 'date'],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'source' => ['nullable', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['required', 'in:cash,transfer,qris,e_wallet'],
            'status' => ['required', 'in:draft,posted'],
        ]);
    }
}
