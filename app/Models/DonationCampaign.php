<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'title',
    'category',
    'description',
    'target_amount',
    'start_date',
    'end_date',
    'status',
    'is_featured',
])]
class DonationCampaign extends Model
{
    protected $appends = ['collected_amount', 'progress_percent'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'target_amount' => 'float',
            'start_date' => 'date',
            'end_date' => 'date',
            'is_featured' => 'boolean',
        ];
    }

    public function entries(): HasMany
    {
        return $this->hasMany(DonationEntry::class);
    }

    public function getCollectedAmountAttribute(): float
    {
        if ($this->relationLoaded('entries')) {
            return (float) $this->entries->where('status', 'confirmed')->sum('amount');
        }

        return (float) $this->entries()->where('status', 'confirmed')->sum('amount');
    }

    public function getProgressPercentAttribute(): int
    {
        if ((float) $this->target_amount <= 0) {
            return 0;
        }

        return min(100, (int) round(($this->collected_amount / (float) $this->target_amount) * 100));
    }
}
