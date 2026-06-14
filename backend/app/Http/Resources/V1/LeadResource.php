<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'card_id' => $this->card_id,
            'card' => $this->whenLoaded('card', fn () => [
                'id' => $this->card->id,
                'full_name' => $this->card->full_name,
                'slug' => $this->card->slug,
            ]),
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'message' => $this->message,
            'source' => $this->source,
            'is_read' => (bool) $this->is_read,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
