<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'role',
    'name',
    'phone',
    'identity_number',
    'address',
    'family_count',
    'muzakki_type',
    'mustahik_category',
    'occupation',
    'income_range',
    'is_active',
    'notes',
])]
class ZakatParticipant extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'family_count' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
