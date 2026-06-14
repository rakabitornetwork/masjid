<?php

namespace App\Http\Controllers;

use App\Models\DocumentArchive;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DocumentArchiveController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('DocumentArchives/Index', [
            'documents' => DocumentArchive::latest('document_date')->latest()->get(),
            'summary' => [
                'total' => DocumentArchive::count(),
                'incoming' => DocumentArchive::where('type', 'incoming')->count(),
                'outgoing' => DocumentArchive::where('type', 'outgoing')->count(),
                'with_attachment' => DocumentArchive::whereNotNull('attachment_path')->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);

        if ($request->hasFile('attachment')) {
            $data['attachment_path'] = $request->file('attachment')->store('document-archives', 'public');
        }

        unset($data['attachment']);

        DocumentArchive::create($data);

        return back()->with('success', 'Arsip surat berhasil ditambahkan.');
    }

    public function update(Request $request, DocumentArchive $documentArchive): RedirectResponse
    {
        $data = $this->validatedData($request);

        if ($request->hasFile('attachment')) {
            if ($documentArchive->attachment_path) {
                Storage::disk('public')->delete($documentArchive->attachment_path);
            }

            $data['attachment_path'] = $request->file('attachment')->store('document-archives', 'public');
        }

        unset($data['attachment']);

        $documentArchive->update($data);

        return back()->with('success', 'Arsip surat berhasil diperbarui.');
    }

    public function destroy(DocumentArchive $documentArchive): RedirectResponse
    {
        if ($documentArchive->attachment_path) {
            Storage::disk('public')->delete($documentArchive->attachment_path);
        }

        $documentArchive->delete();

        return back()->with('success', 'Arsip surat berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request): array
    {
        return $request->validate([
            'type' => ['required', 'in:incoming,outgoing,internal,other'],
            'letter_number' => ['nullable', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'document_date' => ['nullable', 'date'],
            'sender' => ['nullable', 'string', 'max:255'],
            'recipient' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'in:draft,archived,important,expired'],
            'attachment' => ['nullable', 'file', 'mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png', 'max:10240'],
            'notes' => ['nullable', 'string'],
        ]);
    }
}
