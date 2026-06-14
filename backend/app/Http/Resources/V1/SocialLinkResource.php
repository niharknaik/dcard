<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SocialLinkResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'platform' => $this->platform,
            'url' => $this->url,
            'label' => $this->label,
            'sort_order' => $this->sort_order,
            'is_active' => (bool) $this->is_active,
        ];
    }
}
