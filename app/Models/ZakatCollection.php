<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'zakat_participant_id',
    'muzakki_name',
    'muzakki_phone',
    'type',
    'money_amount',
    'rice_amount',
    'payment_method',
    'received_at',
    'status',
    'notes',
])]
class ZakatCollection extends Model
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
            'received_at' => 'date',
        ];
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(ZakatParticipant::class, 'zakat_participant_id');
    }
}
