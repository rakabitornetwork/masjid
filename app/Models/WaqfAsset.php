<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'wakif_name',
    'wakif_phone',
    'asset_name',
    'category',
    'description',
    'estimated_value',
    'received_at',
    'certificate_number',
    'location',
    'status',
    'notes',
])]
class WaqfAsset extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'estimated_value' => 'float',
            'received_at' => 'date',
        ];
    }
}
