<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RewardWalletResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'balance'           => (int) $this->balance,
            'lifetime_earned'   => (int) $this->lifetime_earned,
            'lifetime_redeemed' => (int) $this->lifetime_redeemed,
            'updated_at'        => $this->updated_at?->toIso8601String(),
        ];
    }
}
