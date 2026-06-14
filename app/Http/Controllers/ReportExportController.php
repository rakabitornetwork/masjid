<?php

namespace App\Http\Controllers;

use App\Models\Congregant;
use App\Models\CongregantFamily;
use App\Models\DonationCampaign;
use App\Models\DocumentArchive;
use App\Models\FacilityBooking;
use App\Models\FinancialTransaction;
use App\Models\InventoryItem;
use App\Models\InventoryMaintenance;
use App\Models\PublicArticle;
use App\Models\QurbanParticipant;
use App\Models\SocialAssistanceProgram;
use App\Models\SpecialDonation;
use App\Models\WaqfAsset;
use App\Models\WhatsappNotification;
use App\Models\ZakatCollection;
use App\Models\ZakatDistribution;
use App\Models\ZakatParticipant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportExportController extends Controller
{
    /**
     * @var array<string, array{label: string, description: string}>
     */
    private const REPORTS = [
        'keuangan' => [
            'label' => 'Transaksi Keuangan',
            'description' => 'Export transaksi pemasukan dan pengeluaran.',
        ],
        'jamaah' => [
            'label' => 'Data Jamaah',
            'description' => 'Export database jamaah dan keluarga.',
        ],
        'keluarga-jamaah' => [
            'label' => 'Keluarga Jamaah',
            'description' => 'Export kepala keluarga, alamat, segmentasi, dan jumlah anggota.',
        ],
        'inventaris' => [
            'label' => 'Inventaris Masjid',
            'description' => 'Export barang, kondisi, lokasi, dan nilai inventaris.',
        ],
        'perawatan-inventaris' => [
            'label' => 'Perawatan Inventaris',
            'description' => 'Export riwayat servis, inspeksi, biaya, dan jadwal perawatan.',
        ],
        'donasi' => [
            'label' => 'Program Donasi',
            'description' => 'Export campaign, target, progres, dan status donasi.',
        ],
        'sedekah-khusus' => [
            'label' => 'Sedekah Khusus',
            'description' => 'Export catatan sedekah khusus, kategori, donatur, nominal, metode, dan status.',
        ],
        'arsip-surat' => [
            'label' => 'Arsip Surat',
            'description' => 'Export surat masuk, surat keluar, dan dokumen internal.',
        ],
        'artikel' => [
            'label' => 'Artikel Publik',
            'description' => 'Export berita dan artikel yang dikelola untuk landing page publik.',
        ],
        'notifikasi-wa' => [
            'label' => 'Notifikasi WhatsApp',
            'description' => 'Export pesan WhatsApp manual, penerima, jadwal, dan status kirim.',
        ],
        'booking-fasilitas' => [
            'label' => 'Booking Fasilitas',
            'description' => 'Export pengajuan dan jadwal pemakaian fasilitas masjid.',
        ],
        'zakat-penerimaan' => [
            'label' => 'Penerimaan Zakat',
            'description' => 'Export data muzakki dan penerimaan zakat.',
        ],
        'muzakki-mustahik' => [
            'label' => 'Database Muzakki & Mustahik',
            'description' => 'Export profil pemberi dan penerima zakat beserta kategori, alamat, dan status aktif.',
        ],
        'zakat-penyaluran' => [
            'label' => 'Penyaluran Zakat',
            'description' => 'Export data mustahik dan penyaluran zakat.',
        ],
        'qurban' => [
            'label' => 'Data Qurban',
            'description' => 'Export pekurban, hewan, pembayaran, dan distribusi.',
        ],
        'wakaf' => [
            'label' => 'Data Wakaf',
            'description' => 'Export wakif, aset wakaf, nilai estimasi, status, dan lokasi.',
        ],
        'program-sosial' => [
            'label' => 'Program Sosial',
            'description' => 'Export bantuan sosial, penerima manfaat, nominal, dan status distribusi.',
        ],
    ];

    public function index(Request $request): Response
    {
        abort_unless($request->user()->hasPermission('reports'), 403);

        return Inertia::render('Reports/Index', [
            'reports' => collect(self::REPORTS)
                ->map(fn (array $report, string $key): array => ['key' => $key, ...$report])
                ->values(),
        ]);
    }

    public function download(Request $request, string $report)
    {
        abort_unless(array_key_exists($report, self::REPORTS), 404);
        abort_unless($request->user()->hasPermission('reports'), 403);

        [$headers, $rows] = $this->reportData($report);
        $format = $request->string('format', 'csv')->lower()->toString();

        return match ($format) {
            'xls', 'excel' => $this->downloadExcel($report, $headers, $rows),
            'pdf', 'print' => response()->view('reports.print', [
                'title' => self::REPORTS[$report]['label'],
                'description' => self::REPORTS[$report]['description'],
                'generatedAt' => now()->format('d/m/Y H:i'),
                'headers' => $headers,
                'rows' => $rows,
            ]),
            default => $this->downloadCsv($report, $headers, $rows),
        };
    }

    /**
     * @param  array<int, string>  $headers
     * @param  iterable<array<int, mixed>>  $rows
     */
    private function downloadCsv(string $report, array $headers, iterable $rows): StreamedResponse
    {
        $filename = $report.'-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($headers, $rows): void {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, $headers);

            foreach ($rows as $row) {
                fputcsv($handle, $row);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * @param  array<int, string>  $headers
     * @param  iterable<array<int, mixed>>  $rows
     */
    private function downloadExcel(string $report, array $headers, iterable $rows): StreamedResponse
    {
        $filename = $report.'-'.now()->format('Ymd-His').'.xls';

        return response()->streamDownload(function () use ($headers, $rows, $report): void {
            echo '<html><head><meta charset="UTF-8"></head><body>';
            echo '<table border="1">';
            echo '<caption>'.e(self::REPORTS[$report]['label']).'</caption>';
            echo '<thead><tr>';

            foreach ($headers as $header) {
                echo '<th>'.e($header).'</th>';
            }

            echo '</tr></thead><tbody>';

            foreach ($rows as $row) {
                echo '<tr>';

                foreach ($row as $cell) {
                    echo '<td>'.e((string) $cell).'</td>';
                }

                echo '</tr>';
            }

            echo '</tbody></table></body></html>';
        }, $filename, [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
        ]);
    }

    /**
     * @return array{0: array<int, string>, 1: iterable<array<int, mixed>>}
     */
    private function reportData(string $report): array
    {
        return match ($report) {
            'keuangan' => [
                ['Tanggal', 'Jenis', 'Akun', 'Kategori', 'Deskripsi', 'Nominal', 'Metode', 'Status'],
                FinancialTransaction::with(['account', 'category'])->latest('transaction_date')->get()->map(fn (FinancialTransaction $transaction): array => [
                    $transaction->transaction_date?->format('Y-m-d'),
                    $transaction->type,
                    $transaction->account?->name,
                    $transaction->category?->name,
                    $transaction->description,
                    $transaction->amount,
                    $transaction->payment_method,
                    $transaction->status,
                ]),
            ],
            'jamaah' => [
                ['Nama', 'Keluarga Tertaut', 'Kepala Keluarga', 'Jenis Kelamin', 'Tanggal Lahir', 'Telepon', 'Email', 'RT/RW', 'Pekerjaan', 'Status Aktif', 'Alamat'],
                Congregant::with('family')->orderBy('name')->get()->map(fn (Congregant $congregant): array => [
                    $congregant->name,
                    $congregant->family?->family_head_name,
                    $congregant->family_head,
                    $congregant->gender,
                    $congregant->birth_date?->format('Y-m-d'),
                    $congregant->phone,
                    $congregant->email,
                    $congregant->neighborhood,
                    $congregant->occupation,
                    $congregant->is_active ? 'aktif' : 'nonaktif',
                    $congregant->address,
                ]),
            ],
            'keluarga-jamaah' => [
                ['Kepala Keluarga', 'Telepon', 'RT/RW', 'Segmentasi', 'Status Aktif', 'Jumlah Anggota', 'Alamat', 'Catatan'],
                CongregantFamily::withCount('congregants')->orderBy('family_head_name')->get()->map(fn (CongregantFamily $family): array => [
                    $family->family_head_name,
                    $family->phone,
                    $family->neighborhood,
                    $family->economic_status,
                    $family->is_active ? 'aktif' : 'nonaktif',
                    $family->congregants_count,
                    $family->address,
                    $family->notes,
                ]),
            ],
            'inventaris' => [
                ['Nama', 'Kategori', 'Jumlah', 'Satuan', 'Kondisi', 'Lokasi', 'Tanggal Beli', 'Nilai Estimasi', 'Jadwal Perawatan', 'Status Aktif'],
                InventoryItem::orderBy('category')->orderBy('name')->get()->map(fn (InventoryItem $item): array => [
                    $item->name,
                    $item->category,
                    $item->quantity,
                    $item->unit,
                    $item->condition,
                    $item->location,
                    $item->purchased_at?->format('Y-m-d'),
                    $item->estimated_value,
                    $item->maintenance_due_at?->format('Y-m-d'),
                    $item->is_active ? 'aktif' : 'nonaktif',
                ]),
            ],
            'perawatan-inventaris' => [
                ['Tanggal', 'Barang', 'Jenis', 'Penanggung Jawab', 'Biaya', 'Status', 'Jadwal Berikutnya', 'Catatan'],
                InventoryMaintenance::with('item')->latest('maintenance_date')->get()->map(fn (InventoryMaintenance $maintenance): array => [
                    $maintenance->maintenance_date?->format('Y-m-d'),
                    $maintenance->item?->name,
                    $maintenance->type,
                    $maintenance->handled_by,
                    $maintenance->cost,
                    $maintenance->status,
                    $maintenance->next_due_at?->format('Y-m-d'),
                    $maintenance->description,
                ]),
            ],
            'donasi' => [
                ['Judul', 'Kategori', 'Target', 'Terkumpul', 'Progress (%)', 'Mulai', 'Selesai', 'Status', 'Featured'],
                DonationCampaign::with('entries')->latest()->get()->map(fn (DonationCampaign $campaign): array => [
                    $campaign->title,
                    $campaign->category,
                    $campaign->target_amount,
                    $campaign->collected_amount,
                    $campaign->progress_percent,
                    $campaign->start_date?->format('Y-m-d'),
                    $campaign->end_date?->format('Y-m-d'),
                    $campaign->status,
                    $campaign->is_featured ? 'ya' : 'tidak',
                ]),
            ],
            'sedekah-khusus' => [
                ['Tanggal', 'Kategori', 'Donatur', 'Nomor WA', 'Tujuan', 'Nominal', 'Metode', 'Status', 'Anonim', 'Catatan'],
                SpecialDonation::latest('donated_at')->get()->map(fn (SpecialDonation $donation): array => [
                    $donation->donated_at?->format('Y-m-d'),
                    $donation->category,
                    $donation->donor_name,
                    $donation->donor_phone,
                    $donation->purpose,
                    $donation->amount,
                    $donation->payment_method,
                    $donation->status,
                    $donation->is_anonymous ? 'ya' : 'tidak',
                    $donation->notes,
                ]),
            ],
            'arsip-surat' => [
                ['Tanggal', 'Jenis', 'Nomor Surat', 'Judul', 'Pengirim', 'Penerima', 'Kategori', 'Status', 'Lampiran'],
                DocumentArchive::latest('document_date')->get()->map(fn (DocumentArchive $document): array => [
                    $document->document_date?->format('Y-m-d'),
                    $document->type,
                    $document->letter_number,
                    $document->title,
                    $document->sender,
                    $document->recipient,
                    $document->category,
                    $document->status,
                    $document->attachment_path,
                ]),
            ],
            'artikel' => [
                ['Tanggal Publikasi', 'Judul', 'Slug', 'Kategori', 'Status', 'Unggulan', 'Ringkasan'],
                PublicArticle::latest('published_at')->get()->map(fn (PublicArticle $article): array => [
                    $article->published_at?->format('Y-m-d'),
                    $article->title,
                    $article->slug,
                    $article->category,
                    $article->status,
                    $article->is_featured ? 'ya' : 'tidak',
                    $article->excerpt,
                ]),
            ],
            'notifikasi-wa' => [
                ['Judul', 'Kategori', 'Penerima', 'Nomor WA', 'Status', 'Jadwal Kirim', 'Terkirim', 'Pesan'],
                WhatsappNotification::latest('scheduled_at')->latest()->get()->map(fn (WhatsappNotification $notification): array => [
                    $notification->title,
                    $notification->category,
                    $notification->recipient_name,
                    $notification->recipient_phone,
                    $notification->status,
                    $notification->scheduled_at?->format('Y-m-d H:i'),
                    $notification->sent_at?->format('Y-m-d H:i'),
                    $notification->message,
                ]),
            ],
            'booking-fasilitas' => [
                ['Tanggal', 'Fasilitas', 'Kegiatan', 'Pemohon', 'Nomor WA', 'Mulai', 'Selesai', 'Status', 'Keperluan'],
                FacilityBooking::orderBy('booking_date')->orderBy('start_time')->get()->map(fn (FacilityBooking $booking): array => [
                    $booking->booking_date?->format('Y-m-d'),
                    $booking->facility_name,
                    $booking->event_name,
                    $booking->requester_name,
                    $booking->requester_phone,
                    $booking->start_time,
                    $booking->end_time,
                    $booking->status,
                    $booking->purpose,
                ]),
            ],
            'zakat-penerimaan' => [
                ['Tanggal', 'Database Muzakki', 'Muzakki', 'Telepon', 'Jenis', 'Uang', 'Beras (kg)', 'Metode', 'Status'],
                ZakatCollection::with('participant')->latest('received_at')->get()->map(fn (ZakatCollection $collection): array => [
                    $collection->received_at?->format('Y-m-d'),
                    $collection->participant?->name,
                    $collection->muzakki_name,
                    $collection->muzakki_phone,
                    $collection->type,
                    $collection->money_amount,
                    $collection->rice_amount,
                    $collection->payment_method,
                    $collection->status,
                ]),
            ],
            'muzakki-mustahik' => [
                ['Jenis Data', 'Nama', 'Telepon', 'NIK/Identitas', 'Alamat', 'Jumlah Keluarga', 'Tipe Muzakki', 'Kategori Mustahik', 'Pekerjaan', 'Penghasilan', 'Aktif', 'Catatan'],
                ZakatParticipant::orderBy('role')->orderBy('name')->get()->map(fn (ZakatParticipant $participant): array => [
                    $participant->role,
                    $participant->name,
                    $participant->phone,
                    $participant->identity_number,
                    $participant->address,
                    $participant->family_count,
                    $participant->muzakki_type,
                    $participant->mustahik_category,
                    $participant->occupation,
                    $participant->income_range,
                    $participant->is_active ? 'Ya' : 'Tidak',
                    $participant->notes,
                ]),
            ],
            'zakat-penyaluran' => [
                ['Tanggal', 'Database Mustahik', 'Mustahik', 'Kategori', 'Telepon', 'Alamat', 'Uang', 'Beras (kg)', 'Status'],
                ZakatDistribution::with('participant')->latest('distributed_at')->get()->map(fn (ZakatDistribution $distribution): array => [
                    $distribution->distributed_at?->format('Y-m-d'),
                    $distribution->participant?->name,
                    $distribution->mustahik_name,
                    $distribution->mustahik_category,
                    $distribution->phone,
                    $distribution->address,
                    $distribution->money_amount,
                    $distribution->rice_amount,
                    $distribution->status,
                ]),
            ],
            'qurban' => [
                ['Nama', 'Telepon', 'Hewan', 'Saham', 'Kelompok', 'Dibayar', 'Target', 'Status Bayar', 'Status Qurban', 'Daftar', 'Sembelih'],
                QurbanParticipant::latest('registered_at')->get()->map(fn (QurbanParticipant $participant): array => [
                    $participant->participant_name,
                    $participant->phone,
                    $participant->animal_type,
                    $participant->share_count,
                    $participant->group_name,
                    $participant->amount_paid,
                    $participant->target_amount,
                    $participant->payment_status,
                    $participant->slaughter_status,
                    $participant->registered_at?->format('Y-m-d'),
                    $participant->slaughtered_at?->format('Y-m-d'),
                ]),
            ],
            'wakaf' => [
                ['Tanggal Terima', 'Wakif', 'Telepon', 'Aset', 'Kategori', 'Nilai Estimasi', 'Nomor Sertifikat', 'Lokasi', 'Status', 'Catatan'],
                WaqfAsset::latest('received_at')->get()->map(fn (WaqfAsset $asset): array => [
                    $asset->received_at?->format('Y-m-d'),
                    $asset->wakif_name,
                    $asset->wakif_phone,
                    $asset->asset_name,
                    $asset->category,
                    $asset->estimated_value,
                    $asset->certificate_number,
                    $asset->location,
                    $asset->status,
                    $asset->notes,
                ]),
            ],
            'program-sosial' => [
                ['Tanggal Distribusi', 'Program', 'Kategori', 'Penerima', 'Telepon', 'Alamat', 'Nominal', 'Barang/Paket', 'Status', 'Catatan'],
                SocialAssistanceProgram::latest('distributed_at')->get()->map(fn (SocialAssistanceProgram $program): array => [
                    $program->distributed_at?->format('Y-m-d'),
                    $program->program_name,
                    $program->category,
                    $program->recipient_name,
                    $program->recipient_phone,
                    $program->recipient_address,
                    $program->amount,
                    $program->item_description,
                    $program->status,
                    $program->notes,
                ]),
            ],
        };
    }
}
