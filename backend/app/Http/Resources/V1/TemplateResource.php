<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class TemplateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'slug'           => $this->slug,
            'description'    => $this->description,
            'category'       => new TemplateCategoryResource($this->whenLoaded('category')),
            'thumbnail'      => $this->mediaUrl($this->thumbnail),
            'preview_images' => collect($this->preview_images ?? [])
                ->map(fn ($path) => $this->mediaUrl($path))
                ->filter()
                ->values(),
            'layout'         => $this->layout,
            'color_scheme'   => $this->color_scheme,
            'font_family'    => $this->font_family,
            'config'         => $this->config,
            'price'          => (float) $this->price,
            'currency'       => $this->currency,
            'price_points'   => (int) $this->price_points,
            'is_free'        => (bool) $this->is_free,
            'has_portfolio'  => (bool) $this->has_portfolio,
            'has_contact'    => (bool) $this->has_contact,
            'has_social'     => (bool) $this->has_social,
            'is_unlocked'    => (bool) ($this->is_unlocked ?? false),
            'purchases_count' => (int) $this->purchases_count,
            'usage_count'    => (int) $this->usage_count,
            'created_at'     => $this->created_at?->toIso8601String(),
        ];
    }

    private function mediaUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return str_starts_with($path, 'http') ? $path : Storage::disk('public')->url($path);
    }
}
