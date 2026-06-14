<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class UpdateGuideController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('System/Update');
    }
}
