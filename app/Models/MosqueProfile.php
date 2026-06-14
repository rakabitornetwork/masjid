<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'name',
    'tagline',
    'address',
    'city',
    'province',
    'postal_code',
    'phone',
    'email',
    'website',
    'vision',
    'mission',
    'founded_at',
    'capacity',
    'facilities',
    'social_links',
])]
class MosqueProfile extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'founded_at' => 'date',
            'capacity' => 'integer',
            'facilities' => 'array',
            'social_links' => 'array',
        ];
    }
}
