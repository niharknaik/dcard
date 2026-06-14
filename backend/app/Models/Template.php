<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A marketplace template a user can browse, unlock (money / points) and apply
 * to a card. Distinct from the lightweight CardTemplate visual presets.
 */
class Template extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'template_category_id', 'name', 'slug', 'description',
        'thumbnail', 'preview_images',
        'layout', 'color_scheme', 'font_family', 'config',
        'price', 'currency', 'price_points', 'is_free',
        'has_portfolio', 'has_contact', 'has_social',
        'is_active', 'sort_order', 'purchases_count', 'usage_count',
    ];

    protected function casts(): array
    {
        return [
            'preview_images' => 'array',
            'config'         => 'array',
            'price'          => 'decimal:2',
            'price_points'   => 'integer',
            'is_free'        => 'boolean',
            'has_portfolio'  => 'boolean',
            'has_contact'    => 'boolean',
            'has_social'     => 'boolean',
            'is_active'      => 'boolean',
        ];
    }

    // ---------------- Relationships ----------------

    public function category(): BelongsTo
    {
        return $this->belongsTo(TemplateCategory::class, 'template_category_id');
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(TemplatePurchase::class);
    }

    public function cards(): HasMany
    {
        return $this->hasMany(Card::class, 'template_id');
    }

    // ---------------- Helpers ----------------

    /** Whether this template requires no money and no points. */
    public function isFreeToUnlock(): bool
    {
        return $this->is_free || ((float) $this->price <= 0 && (int) $this->price_points <= 0);
    }

    public function hasMoneyPrice(): bool
    {
        return (float) $this->price > 0;
    }

    public function hasPointsPrice(): bool
    {
        return (int) $this->price_points > 0;
    }

    // ---------------- Scopes ----------------

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
