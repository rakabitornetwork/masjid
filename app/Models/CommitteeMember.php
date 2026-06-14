<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'name',
    'position',
    'phone',
    'email',
    'avatar_path',
    'period_start',
    'period_end',
    'sort_order',
    'is_active',
    'notes',
])]
class CommitteeMember extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'period_end' => 'date',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
