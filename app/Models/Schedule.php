<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'title',
    'type',
    'date',
    'start_time',
    'end_time',
    'location',
    'speaker',
    'imam',
    'khatib',
    'muadzin',
    'description',
    'status',
])]
class Schedule extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }
}
