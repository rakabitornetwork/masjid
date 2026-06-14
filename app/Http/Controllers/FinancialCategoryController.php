<?php

namespace App\Http\Controllers;

use App\Models\FinancialCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinancialCategoryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Finance/Categories', [
            'categories' => FinancialCategory::orderBy('type')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        FinancialCategory::create($this->validatedData($request));

        return back()->with('success', 'Kategori keuangan berhasil ditambahkan.');
    }

    public function update(Request $request, FinancialCategory $category): RedirectResponse
    {
        $category->update($this->validatedData($request));

        return back()->with('success', 'Kategori keuangan berhasil diperbarui.');
    }

    public function destroy(FinancialCategory $category): RedirectResponse
    {
        if ($category->transactions()->exists()) {
            return back()->with('error', 'Kategori yang sudah memiliki transaksi tidak dapat dihapus.');
        }

        $category->delete();

        return back()->with('success', 'Kategori keuangan berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:income,expense'],
            'color' => ['required', 'string', 'max:50'],
            'icon' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);
    }
}
