<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'mosque_facility_id',
    'facility_name',
    'requester_name',
    'requester_phone',
    'event_name',
    'booking_date',
    'start_time',
    'end_time',
    'purpose',
    'status',
    'notes',
])]
class FacilityBooking extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'booking_date' => 'date',
        ];
    }

    public function facility(): BelongsTo
    {
        return $this->belongsTo(MosqueFacility::class, 'mosque_facility_id');
    }
}
