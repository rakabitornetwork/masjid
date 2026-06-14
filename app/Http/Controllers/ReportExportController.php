<?php

namespace App\Http\Controllers;

use App\Models\Congregant;
use App\Models\DonationCampaign;
use App\Models\FinancialTransaction;
use App\Models\InventoryItem;
use App\Models\QurbanParticipant;
use App\Models\ZakatCollection;
use App\Models\ZakatDistribution;
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
        'inventaris' => [
            'label' => 'Inventaris Masjid',
            'description' => 'Export barang, kondisi, lokasi, dan nilai inventaris.',
        ],
        'donasi' => [
            'label' => 'Program Donasi',
            'description' => 'Export campaign, target, progres, dan status donasi.',
        ],
        'zakat-penerimaan' => [
            'label' => 'Penerimaan Zakat',
            'description' => 'Export data muzakki dan penerimaan zakat.',
        ],
        'zakat-penyaluran' => [
            'label' => 'Penyaluran Zakat',
            'description' => 'Export data mustahik dan penyaluran zakat.',
        ],
        'qurban' => [
            'label' => 'Data Qurban',
            'description' => 'Export pekurban, hewan, pembayaran, dan distribusi.',
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

    public function download(Request $request, string $report): StreamedResponse
    {
        abort_unless(array_key_exists($report, self::REPORTS), 404);
        abort_unless($request->user()->hasPermission('reports'), 403);

        [$headers, $rows] = $this->reportData($report);
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
                ['Nama', 'Kepala Keluarga', 'Jenis Kelamin', 'Tanggal Lahir', 'Telepon', 'Email', 'RT/RW', 'Pekerjaan', 'Status Aktif', 'Alamat'],
                Congregant::orderBy('name')->get()->map(fn (Congregant $congregant): array => [
                    $congregant->name,
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
            'zakat-penerimaan' => [
                ['Tanggal', 'Muzakki', 'Telepon', 'Jenis', 'Uang', 'Beras (kg)', 'Metode', 'Status'],
                ZakatCollection::latest('received_at')->get()->map(fn (ZakatCollection $collection): array => [
                    $collection->received_at?->format('Y-m-d'),
                    $collection->muzakki_name,
                    $collection->muzakki_phone,
                    $collection->type,
                    $collection->money_amount,
                    $collection->rice_amount,
                    $collection->payment_method,
                    $collection->status,
                ]),
            ],
            'zakat-penyaluran' => [
                ['Tanggal', 'Mustahik', 'Kategori', 'Telepon', 'Alamat', 'Uang', 'Beras (kg)', 'Status'],
                ZakatDistribution::latest('distributed_at')->get()->map(fn (ZakatDistribution $distribution): array => [
                    $distribution->distributed_at?->format('Y-m-d'),
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
        };
    }
}
