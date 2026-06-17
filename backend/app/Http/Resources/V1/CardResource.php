<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class CardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'full_name' => $this->full_name,
            'profile_photo' => $this->profile_photo ? Storage::disk('public')->url($this->profile_photo) : null,
            'banner' => $this->banner ? Storage::disk('public')->url($this->banner) : null,
            'designation' => $this->designation,
            'company' => $this->company,
            'phone' => $this->phone,
            'whatsapp' => $this->whatsapp,
            'email' => $this->email,
            'website' => $this->website,
            'address' => $this->address,
            'about' => $this->about,
            'theme' => $this->theme,
            'is_published' => (bool) $this->is_published,
            'is_default' => (bool) $this->is_default,
            'views_count' => (int) $this->views_count,
            'public_url' => $this->public_url,
            'qr_url' => url("/api/v1/cards/{$this->id}/qr"),
            'template' => new CardTemplateResource($this->whenLoaded('template')),
            'template_id' => $this->template_id,
            'marketplace_template' => new TemplateResource($this->whenLoaded('marketplaceTemplate')),
            'social_links' => SocialLinkResource::collection($this->whenLoaded('socialLinks')),
            'social_links_count' => $this->whenCounted('socialLinks'),
            'leads_count' => $this->whenCounted('leads'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
