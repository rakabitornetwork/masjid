<?php

namespace App\Http\Controllers;

use App\Models\CommitteeMember;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CommitteeMemberController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('CommitteeMembers/Index', [
            'members' => CommitteeMember::orderBy('sort_order')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        CommitteeMember::create($this->validatedData($request));

        return back()->with('success', 'Pengurus berhasil ditambahkan.');
    }

    public function update(Request $request, CommitteeMember $committeeMember): RedirectResponse
    {
        $committeeMember->update($this->validatedData($request));

        return back()->with('success', 'Pengurus berhasil diperbarui.');
    }

    public function destroy(CommitteeMember $committeeMember): RedirectResponse
    {
        $committeeMember->delete();

        return back()->with('success', 'Pengurus berhasil dihapus.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'members' => ['required', 'array'],
            'members.*.id' => ['required', 'integer', 'exists:committee_members,id'],
            'members.*.sort_order' => ['required', 'integer', 'min:1'],
        ]);

        DB::transaction(function () use ($data): void {
            foreach ($data['members'] as $member) {
                CommitteeMember::whereKey($member['id'])->update([
                    'sort_order' => $member['sort_order'],
                ]);
            }
        });

        return back()->with('success', 'Urutan pengurus berhasil disimpan.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'period_start' => ['nullable', 'date'],
            'period_end' => ['nullable', 'date', 'after_or_equal:period_start'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'notes' => ['nullable', 'string'],
        ]);
    }
}
