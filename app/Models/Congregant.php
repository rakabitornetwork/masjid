<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'name',
    'family_head',
    'gender',
    'birth_date',
    'phone',
    'email',
    'address',
    'neighborhood',
    'occupation',
    'marital_status',
    'is_active',
    'notes',
])]
class Congregant extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'is_active' => 'boolean',
        ];
    }
}
