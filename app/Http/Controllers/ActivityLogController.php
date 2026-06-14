<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('System/ActivityLogs', [
            'logs' => ActivityLog::latest()->limit(100)->get(),
            'summary' => [
                'total' => ActivityLog::count(),
                'today' => ActivityLog::whereDate('created_at', today())->count(),
                'login' => ActivityLog::where('action', 'login')->count(),
                'danger' => ActivityLog::whereIn('action', ['delete', 'restore'])->count(),
            ],
        ]);
    }
}
