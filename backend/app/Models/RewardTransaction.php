<?php

namespace App\Models;

use App\Enums\RewardSource;
use App\Enums\RewardTransactionType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RewardTransaction extends Model
{
    protected $fillable = [
        'user_id', 'reward_wallet_id', 'type', 'source', 'points',
        'balance_after', 'description', 'reference_type', 'reference_id', 'meta',
    ];

    protected function casts(): array
    {
        return [
            'type'          => RewardTransactionType::class,
            'source'        => RewardSource::class,
            'points'        => 'integer',
            'balance_after' => 'integer',
            'meta'          => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(RewardWallet::class, 'reward_wallet_id');
    }
}
