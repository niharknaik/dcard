<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RewardWallet extends Model
{
    protected $fillable = [
        'user_id', 'balance', 'lifetime_earned', 'lifetime_redeemed',
    ];

    protected function casts(): array
    {
        return [
            'balance'           => 'integer',
            'lifetime_earned'   => 'integer',
            'lifetime_redeemed' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(RewardTransaction::class)->latest();
    }
}
