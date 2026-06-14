<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CardTemplate extends Model
{
    protected $fillable = [
        'name', 'slug', 'preview_image', 'config',
        'is_premium', 'is_active', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'config'     => 'array',
            'is_premium' => 'boolean',
            'is_active'  => 'boolean',
        ];
    }

    public function cards(): HasMany
    {
        return $this->hasMany(Card::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
