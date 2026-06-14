<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\SocialLink\StoreSocialLinkRequest;
use App\Http\Requests\SocialLink\UpdateSocialLinkRequest;
use App\Http\Resources\V1\SocialLinkResource;
use App\Models\Card;
use App\Models\SocialLink;
use App\Services\SocialLinkService;
use Illuminate\Http\JsonResponse;

class SocialLinkController extends Controller
{
    public function __construct(private readonly SocialLinkService $links) {}

    public function index(Card $card): JsonResponse
    {
        $this->authorize('view', $card);

        return $this->success(
            SocialLinkResource::collection($card->socialLinks),
            'Social links fetched.'
        );
    }

    public function store(StoreSocialLinkRequest $request, Card $card): JsonResponse
    {
        $this->authorize('update', $card);

        $link = $this->links->create($card, $request->validated());

        return $this->created(new SocialLinkResource($link), 'Social link added.');
    }

    public function update(UpdateSocialLinkRequest $request, SocialLink $socialLink): JsonResponse
    {
        $this->authorize('update', $socialLink);

        $link = $this->links->update($socialLink, $request->validated());

        return $this->success(new SocialLinkResource($link), 'Social link updated.');
    }

    public function destroy(SocialLink $socialLink): JsonResponse
    {
        $this->authorize('delete', $socialLink);

        $this->links->delete($socialLink);

        return $this->success(null, 'Social link deleted.');
    }
}
