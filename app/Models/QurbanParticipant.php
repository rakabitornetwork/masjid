<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'participant_name',
    'phone',
    'animal_type',
    'share_count',
    'group_name',
    'amount_paid',
    'target_amount',
    'payment_status',
    'slaughter_status',
    'registered_at',
    'slaughtered_at',
    'distribution_notes',
    'notes',
])]
class QurbanParticipant extends Model
{
    protected $appends = ['payment_progress'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'share_count' => 'integer',
            'amount_paid' => 'float',
            'target_amount' => 'float',
            'registered_at' => 'date',
            'slaughtered_at' => 'date',
        ];
    }

    public function getPaymentProgressAttribute(): int
    {
        if ((float) $this->target_amount <= 0) {
            return 0;
        }

        return min(100, (int) round(((float) $this->amount_paid / (float) $this->target_amount) * 100));
    }
}
