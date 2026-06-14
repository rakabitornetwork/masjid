<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'program_name',
    'category',
    'recipient_name',
    'recipient_phone',
    'recipient_address',
    'amount',
    'item_description',
    'distributed_at',
    'status',
    'notes',
])]
class SocialAssistanceProgram extends Model
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
            'distributed_at' => 'date',
        ];
    }
}
