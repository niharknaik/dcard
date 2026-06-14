<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Services\AdService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdController extends Controller
{
    public function __construct(private readonly AdService $ads) {}

    /** Ads payload (eligibility, AdMob config, per-placement house ads) for the user. */
    public function index(Request $request): JsonResponse
    {
        return $this->success($this->ads->payloadFor($request->user()), 'Ads fetched.');
    }

    /** Record an impression or click for a house ad. */
    public function track(Request $request, Ad $ad): JsonResponse
    {
        $data = $request->validate([
            'event' => ['required', Rule::in(['impression', 'click'])],
        ]);

        $ad->increment($data['event'] === 'click' ? 'clicks' : 'impressions');

        return $this->noContent('Tracked.');
    }
}
