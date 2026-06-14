<?php

namespace App\Models;

use App\Enums\SubscriptionStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subscription extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'subscription_plan_id', 'status',
        'starts_at', 'ends_at', 'cancelled_at',
        'auto_renew', 'expiry_reminder_sent',
    ];

    protected function casts(): array
    {
        return [
            'status'               => SubscriptionStatus::class,
            'starts_at'            => 'datetime',
            'ends_at'              => 'datetime',
            'cancelled_at'         => 'datetime',
            'auto_renew'           => 'boolean',
            'expiry_reminder_sent' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function isActive(): bool
    {
        return $this->status === SubscriptionStatus::Active
            && ($this->ends_at === null || $this->ends_at->isFuture());
    }

    public function scopeActive($query)
    {
        return $query->where('status', SubscriptionStatus::Active->value);
    }

    public function scopeExpiringWithin($query, int $days)
    {
        return $query->where('status', SubscriptionStatus::Active->value)
            ->whereBetween('ends_at', [now(), now()->addDays($days)]);
    }
}
