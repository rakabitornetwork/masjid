<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'donation_campaign_id',
    'donor_name',
    'donor_phone',
    'amount',
    'payment_method',
    'donated_at',
    'status',
    'notes',
])]
class DonationEntry extends Model
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
        ];
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(DonationCampaign::class, 'donation_campaign_id');
    }
}
