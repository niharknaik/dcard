<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Ad extends Model
{
    /** Supported in-app placement slots. */
    public const PLACEMENTS = ['dashboard_top', 'card_list', 'leads_top', 'app_footer'];

    protected $fillable = [
        'placement', 'audience', 'title', 'image', 'link',
        'is_active', 'starts_at', 'ends_at', 'priority',
    ];

    protected function casts(): array
    {
        return [
            'is_active'   => 'boolean',
            'starts_at'   => 'datetime',
            'ends_at'     => 'datetime',
            'priority'    => 'integer',
            'impressions' => 'integer',
            'clicks'      => 'integer',
        ];
    }

    /** Active within its scheduling window, highest priority first. */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->where(fn (Builder $q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn (Builder $q) => $q->whereNull('ends_at')->orWhere('ends_at', '>=', now()))
            ->orderByDesc('priority')
            ->orderByDesc('id');
    }

    public function scopeForPlacement(Builder $query, string $placement): Builder
    {
        return $query->where('placement', $placement);
    }

    /** Ads marked for everyone, or specifically for the given segment. */
    public function scopeForAudience(Builder $query, string $audience): Builder
    {
        return $query->whereIn('audience', ['all', $audience]);
    }
}
