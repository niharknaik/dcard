<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Card\StoreCardRequest;
use App\Http\Requests\Card\UpdateCardRequest;
use App\Http\Resources\V1\CardResource;
use App\Models\Card;
use App\Services\CardService;
use App\Services\QrService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CardController extends Controller
{
    public function __construct(
        private readonly CardService $cards,
        private readonly QrService $qr,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $cards = $this->cards->list($request->user(), [
            'search' => $request->query('search'),
            'is_published' => $request->has('is_published') ? $request->boolean('is_published') : null,
        ], (int) $request->integer('per_page', 15));

        return $this->success(CardResource::collection($cards), 'Cards fetched.');
    }

    public function store(StoreCardRequest $request): JsonResponse
    {
        $card = $this->cards->create($request->user(), $request->validated());

        return $this->created(new CardResource($card), 'Card created.');
    }

    public function show(Card $card): JsonResponse
    {
        $this->authorize('view', $card);

        $card->load(['socialLinks', 'services', 'portfolioItems', 'template', 'marketplaceTemplate'])
            ->loadCount(['socialLinks', 'leads']);

        return $this->success(new CardResource($card), 'Card fetched.');
    }

    public function update(UpdateCardRequest $request, Card $card): JsonResponse
    {
        $this->authorize('update', $card);

        $card = $this->cards->update($card, $request->validated());

        return $this->success(new CardResource($card), 'Card updated.');
    }

    public function destroy(Card $card): JsonResponse
    {
        $this->authorize('delete', $card);

        $this->cards->delete($card);

        return $this->success(null, 'Card deleted.');
    }

    public function duplicate(Card $card): JsonResponse
    {
        $this->authorize('update', $card);

        $copy = $this->cards->duplicate($card);

        return $this->created(new CardResource($copy), 'Card duplicated.');
    }

    public function qr(Request $request, Card $card): Response
    {
        $this->authorize('view', $card);

        $qr = $this->qr->forCard(
            $card,
            (string) $request->query('format', 'svg'),
            (int) $request->integer('size', 400),
        );

        $headers = ['Content-Type' => $qr['mime']];

        if ($request->boolean('download')) {
            $headers['Content-Disposition'] = 'attachment; filename="card-'.$card->slug.'.'.$qr['extension'].'"';
        }

        return response($qr['content'], 200, $headers);
    }
}
