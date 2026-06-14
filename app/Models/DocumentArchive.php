<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'type',
    'letter_number',
    'title',
    'document_date',
    'sender',
    'recipient',
    'category',
    'status',
    'attachment_path',
    'notes',
])]
class DocumentArchive extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'document_date' => 'date',
        ];
    }
}
