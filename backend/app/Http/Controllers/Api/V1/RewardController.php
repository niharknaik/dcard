<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reward\RedeemPointsRequest;
use App\Http\Resources\V1\RewardTransactionResource;
use App\Http\Resources\V1\RewardWalletResource;
use App\Services\RewardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RewardController extends Controller
{
    public function __construct(private readonly RewardService $rewards) {}

    /** Current points balance + lifetime totals. */
    public function wallet(Request $request): JsonResponse
    {
        return $this->success(
            new RewardWalletResource($this->rewards->walletFor($request->user())),
            'Wallet fetched.',
        );
    }

    /** Paginated points history (the ledger). */
    public function transactions(Request $request): JsonResponse
    {
        return $this->success(
            RewardTransactionResource::collection($this->rewards->history($request->user(), (int) $request->integer('per_page', 20))),
            'Transactions fetched.',
        );
    }

    /** Redeem points. */
    public function redeem(RedeemPointsRequest $request): JsonResponse
    {
        $transaction = $this->rewards->redeem(
            $request->user(),
            (int) $request->integer('points'),
            $request->input('description'),
        );

        return $this->success([
            'transaction' => new RewardTransactionResource($transaction),
            'wallet'      => new RewardWalletResource($this->rewards->walletFor($request->user())),
        ], 'Points redeemed.');
    }
}
