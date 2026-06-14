<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\ReferralResource;
use App\Services\ReferralService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    public function __construct(private readonly ReferralService $referrals) {}

    /** Referral dashboard: code, link, totals and recent referrals. */
    public function dashboard(Request $request): JsonResponse
    {
        $data = $this->referrals->dashboard($request->user());

        return $this->success([
            'referral_code'       => $data['referral_code'],
            'referral_link'       => $data['referral_link'],
            'total_referrals'     => $data['total_referrals'],
            'total_points_earned' => $data['total_points_earned'],
            'referrals'           => ReferralResource::collection($data['referrals']),
        ], 'Referral dashboard fetched.');
    }

    /** Paginated referral history. */
    public function history(Request $request): JsonResponse
    {
        $referrals = $request->user()->referralsMade()
            ->with('referred:id,name,email,created_at')
            ->latest()
            ->paginate((int) $request->integer('per_page', 20));

        return $this->success(ReferralResource::collection($referrals), 'Referrals fetched.');
    }
}
