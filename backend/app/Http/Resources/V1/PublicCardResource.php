<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * Public-facing card payload. Deliberately omits internal identifiers
 * (user_id, team_id) and unpublished/inactive children.
 */
class PublicCardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
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
            'public_url' => $this->public_url,
            'template' => new CardTemplateResource($this->whenLoaded('template')),
            'social_links' => SocialLinkResource::collection($this->whenLoaded('socialLinks')),
            'services' => ServiceResource::collection($this->whenLoaded('services')),
            'portfolio' => PortfolioItemResource::collection($this->whenLoaded('portfolioItems')),
        ];
    }
}
