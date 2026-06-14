<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Team\StoreTeamMemberRequest;
use App\Http\Resources\V1\TeamMemberResource;
use App\Models\TeamMember;
use App\Services\SubscriptionService;
use App\Services\TeamService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    public function __construct(
        private readonly TeamService $teams,
        private readonly SubscriptionService $subscriptions,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->ensureBusinessPlan($request->user());

        return $this->success(
            TeamMemberResource::collection($this->teams->members($request->user())),
            'Team members fetched.'
        );
    }

    public function store(StoreTeamMemberRequest $request): JsonResponse
    {
        $this->ensureBusinessPlan($request->user());

        $member = $this->teams->addEmployee($request->user(), $request->validated());

        return $this->created(new TeamMemberResource($member), 'Team member added.');
    }

    public function destroy(Request $request, TeamMember $member): JsonResponse
    {
        $this->ensureBusinessPlan($request->user());

        $this->teams->removeMember($request->user(), $member);

        return $this->success(null, 'Team member removed.');
    }

    public function analytics(Request $request): JsonResponse
    {
        $this->ensureBusinessPlan($request->user());

        return $this->success($this->teams->analytics($request->user()), 'Team analytics fetched.');
    }

    private function ensureBusinessPlan($user): void
    {
        abort_unless(
            $this->subscriptions->allows($user, 'team'),
            403,
            'Team management is available on the Business plan. Please upgrade.'
        );
    }
}
