<?php

namespace App\Http\Resources\V1;

use App\Enums\SubscriptionStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $status = $this->status instanceof SubscriptionStatus ? $this->status->value : $this->status;

        return [
            'id' => $this->id,
            'status' => $status,
            'starts_at' => $this->starts_at?->toIso8601String(),
            'ends_at' => $this->ends_at?->toIso8601String(),
            'auto_renew' => (bool) $this->auto_renew,
            'is_active' => $this->isActive(),
            'plan' => new PlanResource($this->whenLoaded('plan')),
        ];
    }
}
