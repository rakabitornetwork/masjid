<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title }} - Laporan</title>
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            color: #0f172a;
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 24px;
        }

        .header {
            border-bottom: 2px solid #0f766e;
            margin-bottom: 16px;
            padding-bottom: 10px;
        }

        .eyebrow {
            color: #0f766e;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.16em;
            text-transform: uppercase;
        }

        h1 {
            font-size: 22px;
            margin: 4px 0;
        }

        p {
            color: #475569;
            margin: 0;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        th,
        td {
            border: 1px solid #cbd5e1;
            padding: 7px;
            text-align: left;
            vertical-align: top;
        }

        th {
            background: #ccfbf1;
            color: #134e4a;
            font-size: 10px;
            text-transform: uppercase;
        }

        tr:nth-child(even) td {
            background: #f8fafc;
        }

        .empty {
            border: 1px dashed #99f6e4;
            border-radius: 10px;
            color: #64748b;
            padding: 18px;
            text-align: center;
        }

        .actions {
            margin-bottom: 14px;
        }

        .actions button {
            background: #0d9488;
            border: 0;
            border-radius: 8px;
            color: white;
            cursor: pointer;
            font-size: 12px;
            font-weight: 700;
            padding: 8px 12px;
        }

        @media print {
            body {
                margin: 12mm;
            }

            .actions {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="actions">
        <button type="button" onclick="window.print()">Print / Save as PDF</button>
    </div>

    <header class="header">
        <div class="eyebrow">Laporan Aplikasi Masjid</div>
        <h1>{{ $title }}</h1>
        <p>{{ $description }}</p>
        <p>Dicetak pada {{ $generatedAt }}</p>
    </header>

    @if (count($rows) > 0)
        <table>
            <thead>
                <tr>
                    @foreach ($headers as $header)
                        <th>{{ $header }}</th>
                    @endforeach
                </tr>
            </thead>
            <tbody>
                @foreach ($rows as $row)
                    <tr>
                        @foreach ($row as $cell)
                            <td>{{ $cell }}</td>
                        @endforeach
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div class="empty">Belum ada data pada laporan ini.</div>
    @endif

    <script>
        window.addEventListener('load', () => {
            window.setTimeout(() => window.print(), 300);
        });
    </script>
</body>
</html>
