<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReferralResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'points_awarded' => (int) $this->points_awarded,
            'status'         => $this->status,
            'rewarded_at'    => $this->rewarded_at?->toIso8601String(),
            'created_at'     => $this->created_at?->toIso8601String(),
            'referred'       => $this->whenLoaded('referred', fn () => [
                'id'         => $this->referred?->id,
                'name'       => $this->referred?->name,
                'email'      => $this->referred?->email,
                'created_at' => $this->referred?->created_at?->toIso8601String(),
            ]),
        ];
    }
}
