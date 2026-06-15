<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContentReport\StoreContentReportRequest;
use App\Models\ContentReport;
use App\Repositories\Contracts\CardRepositoryInterface;
use Illuminate\Http\JsonResponse;

class ContentReportController extends Controller
{
    /**
     * Public: a visitor reports a public card (or one of its portfolio items)
     * for spam/abuse/illegal/impersonation. No auth required — rate-limited via
     * the throttle:public middleware on the route group. (COMPLIANCE §5,
     * Play UGC policy: provide an in-product report/takedown path.)
     */
    public function store(StoreContentReportRequest $request, string $slug, CardRepositoryInterface $cards): JsonResponse
    {
        $card = $cards->findPublishedBySlug($slug);

        abort_if($card === null, 404, 'Card not found.');

        $data = $request->validated();

        // Only accept a portfolio_item_id that actually belongs to this card.
        $portfolioItemId = null;
        if (! empty($data['portfolio_item_id'])) {
            $portfolioItemId = $card->portfolioItems()
                ->whereKey($data['portfolio_item_id'])
                ->value('id');
        }

        ContentReport::create([
            'card_id' => $card->id,
            'portfolio_item_id' => $portfolioItemId,
            'reporter_user_id' => $request->user()?->id,
            'reporter_name' => $data['reporter_name'] ?? null,
            'reporter_email' => $data['reporter_email'] ?? null,
            'reason' => $data['reason'],
            'details' => $data['details'] ?? null,
            'ip_address' => $request->ip(),
        ]);

        return $this->created(null, 'Thanks for reporting. Our team will review this content.');
    }
}
