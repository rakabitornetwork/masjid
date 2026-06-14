<?php

namespace App\Http\Controllers;

use App\Models\SocialAssistanceProgram;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SocialAssistanceProgramController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('SocialAssistance/Index', [
            'programs' => SocialAssistanceProgram::latest('distributed_at')->latest()->get(),
            'summary' => [
                'total' => SocialAssistanceProgram::count(),
                'planned' => SocialAssistanceProgram::where('status', 'planned')->count(),
                'distributed' => SocialAssistanceProgram::where('status', 'distributed')->count(),
                'amount' => (float) SocialAssistanceProgram::sum('amount'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        SocialAssistanceProgram::create($this->validatedData($request));

        return back()->with('success', 'Program sosial berhasil ditambahkan.');
    }

    public function update(Request $request, SocialAssistanceProgram $socialAssistanceProgram): RedirectResponse
    {
        $socialAssistanceProgram->update($this->validatedData($request));

        return back()->with('success', 'Program sosial berhasil diperbarui.');
    }

    public function destroy(SocialAssistanceProgram $socialAssistanceProgram): RedirectResponse
    {
        $socialAssistanceProgram->delete();

        return back()->with('success', 'Program sosial berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request): array
    {
        return $request->validate([
            'program_name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'in:duafa,orphan,education,health,disaster,ramadhan,other'],
            'recipient_name' => ['required', 'string', 'max:255'],
            'recipient_phone' => ['nullable', 'string', 'max:50'],
            'recipient_address' => ['nullable', 'string'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'item_description' => ['nullable', 'string'],
            'distributed_at' => ['nullable', 'date'],
            'status' => ['required', 'in:planned,scheduled,distributed,cancelled'],
            'notes' => ['nullable', 'string'],
        ]);
    }
}
