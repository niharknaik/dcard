<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubscriptionPlan extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'code', 'description', 'price', 'currency',
        'billing_period', 'play_product_id', 'features', 'card_limit',
        'allow_portfolio', 'allow_leads', 'allow_team',
        'is_active', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'features'        => 'array',
            'price'           => 'decimal:2',
            'card_limit'      => 'integer',
            'allow_portfolio' => 'boolean',
            'allow_leads'     => 'boolean',
            'allow_team'      => 'boolean',
            'is_active'       => 'boolean',
        ];
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function isUnlimitedCards(): bool
    {
        return (int) $this->card_limit === 0;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
