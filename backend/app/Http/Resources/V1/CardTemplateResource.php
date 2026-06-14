<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class CardTemplateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'preview_image' => $this->preview_image ? Storage::disk('public')->url($this->preview_image) : null,
            'config' => $this->config,
            'is_premium' => (bool) $this->is_premium,
        ];
    }
}
