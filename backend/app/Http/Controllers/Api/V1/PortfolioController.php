<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portfolio\StorePortfolioRequest;
use App\Http\Requests\Portfolio\UpdatePortfolioRequest;
use App\Http\Resources\V1\PortfolioItemResource;
use App\Models\Card;
use App\Models\PortfolioItem;
use App\Services\PortfolioService;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;

class PortfolioController extends Controller
{
    public function __construct(
        private readonly PortfolioService $portfolio,
        private readonly SubscriptionService $subscriptions,
    ) {}

    public function index(Card $card): JsonResponse
    {
        $this->authorize('view', $card);

        return $this->success(
            PortfolioItemResource::collection($card->portfolioItems),
            'Portfolio items fetched.'
        );
    }

    public function store(StorePortfolioRequest $request, Card $card): JsonResponse
    {
        $this->authorize('update', $card);
        $this->ensurePlanAllowsPortfolio($request->user());

        $item = $this->portfolio->create($card, $request->validated());

        return $this->created(new PortfolioItemResource($item), 'Portfolio item added.');
    }

    public function update(UpdatePortfolioRequest $request, PortfolioItem $portfolio): JsonResponse
    {
        $this->authorize('update', $portfolio);

        $item = $this->portfolio->update($portfolio, $request->validated());

        return $this->success(new PortfolioItemResource($item), 'Portfolio item updated.');
    }

    public function destroy(PortfolioItem $portfolio): JsonResponse
    {
        $this->authorize('delete', $portfolio);

        $this->portfolio->delete($portfolio);

        return $this->success(null, 'Portfolio item deleted.');
    }

    private function ensurePlanAllowsPortfolio($user): void
    {
        abort_unless(
            $this->subscriptions->allows($user, 'portfolio'),
            403,
            'Your current plan does not include portfolio uploads. Please upgrade.'
        );
    }
}
