<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\AnalyticsEventType;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\PublicCardResource;
use App\Repositories\Contracts\CardRepositoryInterface;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicCardController extends Controller
{
    public function __construct(
        private readonly CardRepositoryInterface $cards,
        private readonly AnalyticsService $analytics,
    ) {}

    /**
     * Public card view. Records a "view" analytics event (which increments the
     * denormalized counter and fires milestone notifications).
     */
    public function show(Request $request, string $slug): JsonResponse
    {
        $card = $this->cards->findPublishedBySlug($slug);

        abort_if($card === null, 404, 'Card not found.');

        $this->analytics->record($card, AnalyticsEventType::View, $request);

        return $this->success(new PublicCardResource($card), 'Card fetched.');
    }
}
