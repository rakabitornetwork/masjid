<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'whatsapp_campaign_id',
    'congregant_id',
    'whatsapp_notification_id',
    'recipient_name',
    'recipient_phone',
    'sequence',
    'status',
    'scheduled_at',
    'sent_at',
    'error_message',
])]
class WhatsappCampaignRecipient extends Model
{
    public function campaign(): BelongsTo
    {
        return $this->belongsTo(WhatsappCampaign::class, 'whatsapp_campaign_id');
    }

    public function congregant(): BelongsTo
    {
        return $this->belongsTo(Congregant::class);
    }

    public function notification(): BelongsTo
    {
        return $this->belongsTo(WhatsappNotification::class, 'whatsapp_notification_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sequence' => 'integer',
            'scheduled_at' => 'datetime',
            'sent_at' => 'datetime',
        ];
    }
}
