<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\AnalyticsEventType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Analytics\RecordEventRequest;
use App\Models\Card;
use App\Repositories\Contracts\CardRepositoryInterface;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function __construct(private readonly AnalyticsService $analytics) {}

    /** Public: record a visitor interaction event for a card. */
    public function record(RecordEventRequest $request, string $slug, CardRepositoryInterface $cards): JsonResponse
    {
        $card = $cards->findPublishedBySlug($slug);

        abort_if($card === null, 404, 'Card not found.');

        $this->analytics->record(
            $card,
            AnalyticsEventType::from($request->string('type')),
            $request,
            $request->input('metadata', []),
        );

        return $this->success(null, 'Event recorded.');
    }

    /** Authenticated: per-card analytics with chart series. */
    public function card(Request $request, Card $card): JsonResponse
    {
        $this->authorize('view', $card);

        return $this->success(
            $this->analytics->cardSummary($card, $this->period($request)),
            'Card analytics fetched.'
        );
    }

    /** Authenticated: account-wide analytics summary. */
    public function summary(Request $request): JsonResponse
    {
        return $this->success(
            $this->analytics->userSummary($request->user(), $this->period($request)),
            'Analytics summary fetched.'
        );
    }

    private function period(Request $request): string
    {
        $period = (string) $request->query('period', 'daily');

        return in_array($period, ['daily', 'weekly', 'monthly'], true) ? $period : 'daily';
    }
}
