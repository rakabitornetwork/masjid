<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'name',
    'category',
    'quantity',
    'unit',
    'condition',
    'location',
    'purchased_at',
    'estimated_value',
    'maintenance_due_at',
    'is_active',
    'notes',
])]
class InventoryItem extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'purchased_at' => 'date',
            'estimated_value' => 'float',
            'maintenance_due_at' => 'date',
            'is_active' => 'boolean',
        ];
    }
}
