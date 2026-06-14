<?php

namespace App\Http\Resources\V1;

use App\Enums\RewardSource;
use App\Enums\RewardTransactionType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RewardTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $type = $this->type instanceof RewardTransactionType ? $this->type : RewardTransactionType::tryFrom((string) $this->type);
        $source = $this->source instanceof RewardSource ? $this->source : RewardSource::tryFrom((string) $this->source);

        return [
            'id'            => $this->id,
            'type'          => $type?->value,
            'source'        => $source?->value,
            'source_label'  => $source?->label(),
            'points'        => (int) $this->points,
            'signed_points' => ($type === RewardTransactionType::Debit ? -1 : 1) * (int) $this->points,
            'balance_after' => (int) $this->balance_after,
            'description'   => $this->description,
            'created_at'    => $this->created_at?->toIso8601String(),
        ];
    }
}
