<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name',
    'category',
    'location',
    'capacity',
    'condition',
    'availability_status',
    'booking_fee',
    'responsible_person',
    'responsible_phone',
    'is_bookable',
    'is_active',
    'notes',
])]
class MosqueFacility extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'capacity' => 'integer',
            'booking_fee' => 'float',
            'is_bookable' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(FacilityBooking::class);
    }
}
