<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'family_head_name',
    'phone',
    'address',
    'neighborhood',
    'economic_status',
    'is_active',
    'notes',
])]
class CongregantFamily extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function congregants(): HasMany
    {
        return $this->hasMany(Congregant::class);
    }
}
