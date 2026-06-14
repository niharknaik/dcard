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
}
