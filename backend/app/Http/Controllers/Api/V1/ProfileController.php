<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\ChangePasswordRequest;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Resources\V1\UserResource;
use App\Services\AuthService;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(
        private readonly UserService $users,
        private readonly AuthService $auth,
    ) {}

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $this->users->updateProfile($request->user(), $request->validated());

        return $this->success(new UserResource($user), 'Profile updated.');
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $this->auth->changePassword(
            $request->user(),
            $request->string('current_password'),
            $request->string('password'),
        );

        return $this->success(null, 'Password changed successfully.');
    }

    public function destroy(Request $request): JsonResponse
    {
        $this->users->deleteAccount($request->user());
        $this->auth->logout();

        return $this->success(null, 'Account deleted.');
    }

    /**
     * DPDP "right to access" — export all data held about the authenticated user.
     */
    public function export(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $user->loadMissing([
            'cards',
            'subscriptions.plan',
            'payments',
            'rewardWallet.transactions',
            'referralsMade.referred',
        ]);

        $data = [
            'profile' => [
                'name'       => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone,
                'created_at' => $user->created_at,
            ],
            'cards' => $user->cards->map(fn ($card) => [
                'id'           => $card->id,
                'slug'         => $card->slug,
                'full_name'    => $card->full_name,
                'designation'  => $card->designation,
                'company'      => $card->company,
                'email'        => $card->email,
                'phone'        => $card->phone,
                'is_published' => $card->is_published,
                'views_count'  => $card->views_count,
                'created_at'   => $card->created_at,
            ])->all(),
            'leads_count'   => $user->cards->isEmpty()
                ? 0
                : \App\Models\Lead::whereIn('card_id', $user->cards->pluck('id'))->count(),
            'subscriptions' => $user->subscriptions->map(fn ($subscription) => [
                'id'         => $subscription->id,
                'plan'       => $subscription->plan?->name,
                'status'     => $subscription->status,
                'starts_at'  => $subscription->starts_at,
                'ends_at'    => $subscription->ends_at,
                'auto_renew' => $subscription->auto_renew,
            ])->all(),
            'payments' => $user->payments->map(fn ($payment) => [
                'id'     => $payment->id,
                'amount' => $payment->amount,
                'status' => $payment->status,
                'date'   => $payment->paid_at ?? $payment->created_at,
            ])->all(),
            'reward_wallet' => [
                'balance'      => $user->rewardBalance(),
                'transactions' => optional($user->rewardWallet)->transactions?->map(fn ($txn) => [
                    'type'          => $txn->type,
                    'source'        => $txn->source,
                    'points'        => $txn->points,
                    'balance_after' => $txn->balance_after,
                    'description'   => $txn->description,
                    'created_at'    => $txn->created_at,
                ])->all() ?? [],
            ],
            'referrals' => $user->referralsMade->map(fn ($referral) => [
                'referred_name'  => $referral->referred?->name,
                'referral_code'  => $referral->referral_code,
                'points_awarded' => $referral->points_awarded,
                'status'         => $referral->status,
                'rewarded_at'    => $referral->rewarded_at,
            ])->all(),
        ];

        return $this->success($data, 'Account data export.');
    }
}
