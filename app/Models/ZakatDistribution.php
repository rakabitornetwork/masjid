<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'mustahik_name',
    'mustahik_category',
    'phone',
    'address',
    'money_amount',
    'rice_amount',
    'distributed_at',
    'status',
    'notes',
])]
class ZakatDistribution extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'money_amount' => 'float',
            'rice_amount' => 'float',
            'distributed_at' => 'date',
        ];
    }
}
