<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lead\StoreLeadRequest;
use App\Http\Resources\V1\LeadResource;
use App\Models\Lead;
use App\Repositories\Contracts\CardRepositoryInterface;
use App\Services\LeadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LeadController extends Controller
{
    public function __construct(private readonly LeadService $leads) {}

    /** Public: capture a lead from a card's public page. */
    public function store(StoreLeadRequest $request, string $slug, CardRepositoryInterface $cards): JsonResponse
    {
        $card = $cards->findPublishedBySlug($slug);

        abort_if($card === null, 404, 'Card not found.');

        // Honeypot tripped: respond as if successful so bots can't distinguish a
        // rejection, but never store or notify.
        if ($request->isBot()) {
            return $this->created(null, 'Thanks! Your message has been sent.');
        }

        $this->leads->capture($card, $request->validated(), $request->ip());

        return $this->created(null, 'Thanks! Your message has been sent.');
    }

    /** Authenticated: list/search the owner's leads across all cards. */
    public function index(Request $request): JsonResponse
    {
        $items = $this->leads->list($request->user(), $this->filters($request), (int) $request->integer('per_page', 15));

        return $this->success(LeadResource::collection($items), 'Leads fetched.');
    }

    public function markRead(Lead $lead): JsonResponse
    {
        $this->authorize('update', $lead);

        $lead = $this->leads->markRead($lead);

        return $this->success(new LeadResource($lead), 'Lead marked as read.');
    }

    public function export(Request $request): StreamedResponse
    {
        return $this->leads->exportCsv($request->user(), $this->filters($request));
    }

    private function filters(Request $request): array
    {
        return [
            'search' => $request->query('search'),
            'card_id' => $request->query('card_id'),
            'is_read' => $request->has('is_read') ? $request->boolean('is_read') : null,
        ];
    }
}
