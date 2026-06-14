<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PortfolioItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'media_url' => $this->media_path ? Storage::disk('public')->url($this->media_path) : null,
            'thumbnail_url' => $this->thumbnail_path ? Storage::disk('public')->url($this->thumbnail_path) : null,
            'mime_type' => $this->mime_type,
            'size' => $this->size,
            'sort_order' => $this->sort_order,
        ];
    }
}
