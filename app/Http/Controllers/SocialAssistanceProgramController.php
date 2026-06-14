<?php

namespace App\Http\Controllers;

use App\Models\SocialAssistanceProgram;
use App\Services\AutomatedWhatsappNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SocialAssistanceProgramController extends Controller
{
    public function index(AutomatedWhatsappNotificationService $whatsapp): Response
    {
        return Inertia::render('SocialAssistance/Index', [
            'programs' => SocialAssistanceProgram::latest('distributed_at')->latest()->get(),
            'api' => $whatsapp->gatewayInfo(),
            'summary' => [
                'total' => SocialAssistanceProgram::count(),
                'planned' => SocialAssistanceProgram::where('status', 'planned')->count(),
                'distributed' => SocialAssistanceProgram::where('status', 'distributed')->count(),
                'amount' => (float) SocialAssistanceProgram::sum('amount'),
            ],
        ]);
    }

    public function store(Request $request, AutomatedWhatsappNotificationService $whatsapp): RedirectResponse
    {
        $program = SocialAssistanceProgram::create($this->validatedData($request));

        if (! $request->boolean('send_whatsapp')) {
            return back()->with('success', 'Program sosial berhasil ditambahkan.');
        }

        $sendResult = $whatsapp->send(
            title: 'Konfirmasi Program Sosial',
            category: 'program_sosial',
            recipientName: $program->recipient_name,
            recipientPhone: $program->recipient_phone,
            message: $this->socialAssistanceConfirmationMessage($program),
            sourceNotes: 'Dibuat otomatis dari form Program Sosial.',
            missingPhoneMessage: 'WhatsApp tidak dikirim karena nomor WA penerima belum diisi.',
        );

        return back()->with('success', 'Program sosial berhasil ditambahkan. '.$sendResult);
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

    private function socialAssistanceConfirmationMessage(SocialAssistanceProgram $program): string
    {
        $distributedAt = $program->distributed_at?->translatedFormat('d F Y') ?: '-';
        $amount = $program->amount > 0
            ? 'Rp'.number_format((float) $program->amount, 0, ',', '.')
            : '-';
        $item = filled($program->item_description) ? $program->item_description : '-';

        return "Assalamu'alaikum warahmatullahi wabarakatuh.\n\n"
            ."Bapak/Ibu {$program->recipient_name}, data bantuan sosial untuk Anda telah berhasil tercatat di sistem Masjid.\n\n"
            ."Program: {$program->program_name}\n"
            .'Kategori: '.$this->categoryLabel($program->category)."\n"
            ."Tanggal Distribusi: {$distributedAt}\n"
            ."Nominal: {$amount}\n"
            ."Bantuan Barang/Paket: {$item}\n\n"
            ."Informasi ini dikirim otomatis sebagai konfirmasi pencatatan program sosial.\n\n"
            .'Jazakumullahu khairan.';
    }

    private function categoryLabel(string $category): string
    {
        return match ($category) {
            'duafa' => 'Dhuafa',
            'orphan' => 'Yatim/Piatu',
            'education' => 'Pendidikan',
            'health' => 'Kesehatan',
            'disaster' => 'Bencana',
            'ramadhan' => 'Ramadhan',
            default => 'Lainnya',
        };
    }
}
