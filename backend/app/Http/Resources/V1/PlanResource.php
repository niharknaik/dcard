<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'code' => $this->code,
            'description' => $this->description,
            'price' => (float) $this->price,
            'currency' => $this->currency,
            'billing_period' => $this->billing_period,
            'play_product_id' => $this->play_product_id,
            'features' => $this->features ?? [],
            'card_limit' => (int) $this->card_limit,
            'unlimited_cards' => $this->isUnlimitedCards(),
            'allow_portfolio' => (bool) $this->allow_portfolio,
            'allow_leads' => (bool) $this->allow_leads,
            'allow_team' => (bool) $this->allow_team,
            'is_active' => (bool) $this->is_active,
        ];
    }
}
