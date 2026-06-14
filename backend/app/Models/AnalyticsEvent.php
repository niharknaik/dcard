<?php

namespace App\Models;

use App\Enums\AnalyticsEventType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalyticsEvent extends Model
{
    use HasFactory;

    public const UPDATED_AT = null; // immutable event stream (created_at only)

    protected $fillable = [
        'card_id', 'type', 'visitor_hash', 'ip_address',
        'user_agent', 'referrer', 'country', 'metadata', 'created_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata'   => 'array',
            'type'       => AnalyticsEventType::class,
            'created_at' => 'datetime',
        ];
    }

    public function card(): BelongsTo
    {
        return $this->belongsTo(Card::class);
    }
}
