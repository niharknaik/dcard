<?php

namespace App\Models;

use App\Enums\NotificationType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'user_id', 'type', 'title', 'message', 'data', 'is_read', 'read_at',
    ];

    protected function casts(): array
    {
        return [
            'data'    => 'array',
            'type'    => NotificationType::class,
            'is_read' => 'boolean',
            'read_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function markAsRead(): void
    {
        if (! $this->is_read) {
            $this->forceFill(['is_read' => true, 'read_at' => now()])->save();
        }
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }
}
