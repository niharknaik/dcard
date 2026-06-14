<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\PlanResource;
use App\Models\SubscriptionPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class PlanController extends Controller
{
    public function index(): JsonResponse
    {
        // Plans change rarely; cache for 10 minutes to cut DB load on a hot path.
        $plans = Cache::remember('plans.active', 600, fn () => SubscriptionPlan::active()->orderBy('sort_order')->get());

        return $this->success(PlanResource::collection($plans), 'Plans fetched.');
    }
}
