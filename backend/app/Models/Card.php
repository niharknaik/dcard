<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'team_id', 'card_template_id', 'template_id', 'slug',
        'full_name', 'profile_photo', 'banner', 'designation', 'company',
        'phone', 'whatsapp', 'email', 'website', 'address', 'about',
        'theme', 'is_published', 'is_default', 'views_count',
    ];

    protected function casts(): array
    {
        return [
            'theme'        => 'array',
            'is_published' => 'boolean',
            'is_default'   => 'boolean',
            'views_count'  => 'integer',
        ];
    }

    // Management routes bind by id; public routes use {card:slug} explicitly.

    public function getPublicUrlAttribute(): string
    {
        return rtrim(config('app.card_public_base_url', config('app.url')), '/').'/c/'.$this->slug;
    }

    // ---------------- Relationships ----------------

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(CardTemplate::class, 'card_template_id');
    }

    /** The applied marketplace template (Template Marketplace feature). */
    public function marketplaceTemplate(): BelongsTo
    {
        return $this->belongsTo(Template::class, 'template_id');
    }

    public function socialLinks(): HasMany
    {
        return $this->hasMany(SocialLink::class)->orderBy('sort_order');
    }

    public function portfolioItems(): HasMany
    {
        return $this->hasMany(PortfolioItem::class)->orderBy('sort_order');
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class)->orderBy('sort_order');
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }

    public function analyticsEvents(): HasMany
    {
        return $this->hasMany(AnalyticsEvent::class);
    }

    public function dailyAnalytics(): HasMany
    {
        return $this->hasMany(CardAnalyticsDaily::class);
    }

    // ---------------- Scopes ----------------

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }
}
