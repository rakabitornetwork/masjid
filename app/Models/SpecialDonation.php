<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'donor_name',
    'donor_phone',
    'category',
    'purpose',
    'amount',
    'payment_method',
    'donated_at',
    'status',
    'is_anonymous',
    'notes',
])]
class SpecialDonation extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'float',
            'donated_at' => 'date',
            'is_anonymous' => 'boolean',
        ];
    }
}
