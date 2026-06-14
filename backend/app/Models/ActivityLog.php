<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Append-only audit trail of privileged admin actions.
 */
class ActivityLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id', 'action', 'subject_type', 'subject_id',
        'description', 'properties', 'ip_address', 'created_at',
    ];

    protected function casts(): array
    {
        return [
            'properties' => 'array',
            'created_at' => 'datetime',
        ];
    }

    /** The admin who performed the action. */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** The record the action was performed on (polymorphic). */
    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Record an audit entry for the currently authenticated actor.
     *
     * @param  array<string, mixed>  $properties
     */
    public static function record(
        string $action,
        ?Model $subject = null,
        ?string $description = null,
        array $properties = [],
    ): self {
        return static::create([
            'user_id'      => auth()->id(),
            'action'       => $action,
            'subject_type' => $subject?->getMorphClass(),
            'subject_id'   => $subject?->getKey(),
            'description'  => $description,
            'properties'   => $properties ?: null,
            'ip_address'   => request()->ip(),
            'created_at'   => now(),
        ]);
    }
}
