<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Subscription\CheckoutRequest;
use App\Http\Resources\V1\PaymentResource;
use App\Http\Resources\V1\SubscriptionResource;
use App\Models\SubscriptionPlan;
use App\Services\PaymentService;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function __construct(
        private readonly SubscriptionService $subscriptions,
        private readonly PaymentService $payments,
    ) {}

    /** Current active subscription (or the effective Free plan). */
    public function current(Request $request): JsonResponse
    {
        $user = $request->user();

        $subscription = $user->subscriptions()
            ->where('status', 'active')
            ->with('plan')
            ->latest('starts_at')
            ->first();

        return $this->success([
            'plan' => new \App\Http\Resources\V1\PlanResource($this->subscriptions->currentPlan($user)),
            'subscription' => $subscription ? new SubscriptionResource($subscription) : null,
        ], 'Subscription fetched.');
    }

    /** Start a checkout: returns the Razorpay order to open Checkout. */
    public function checkout(CheckoutRequest $request): JsonResponse
    {
        $plan = SubscriptionPlan::findOrFail($request->integer('plan_id'));

        $result = $this->payments->checkout($request->user(), $plan);

        return $this->created([
            'payment' => new PaymentResource($result['payment']),
            'order' => $result['order'],
            'razorpay_key' => $result['razorpay_key'],
        ], 'Checkout created.');
    }
}
