<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
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
}
