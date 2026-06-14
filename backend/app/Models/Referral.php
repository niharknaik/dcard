<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Referral extends Model
{
    protected $fillable = [
        'referrer_id', 'referred_id', 'referral_code',
        'points_awarded', 'status', 'rewarded_at',
    ];

    protected function casts(): array
    {
        return [
            'points_awarded' => 'integer',
            'rewarded_at'    => 'datetime',
        ];
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function referred(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_id');
    }
}
