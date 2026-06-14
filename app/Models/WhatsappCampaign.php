<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'title',
    'category',
    'message',
    'interval_minutes',
    'starts_at',
    'status',
    'total_recipients',
    'sent_count',
    'failed_count',
    'pending_review_count',
    'filters',
    'notes',
])]
class WhatsappCampaign extends Model
{
    public function recipients(): HasMany
    {
        return $this->hasMany(WhatsappCampaignRecipient::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'interval_minutes' => 'integer',
            'starts_at' => 'datetime',
            'total_recipients' => 'integer',
            'sent_count' => 'integer',
            'failed_count' => 'integer',
            'pending_review_count' => 'integer',
            'filters' => 'array',
        ];
    }
}
