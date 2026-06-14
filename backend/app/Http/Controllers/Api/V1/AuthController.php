<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Resources\V1\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $auth) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->auth->register($request->validated());

        return $this->respondWithToken($result, 'Registration successful.', 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->auth->login($request->string('email'), $request->string('password'));

        return $this->respondWithToken($result, 'Login successful.');
    }

    public function me(): JsonResponse
    {
        $user = Auth::guard('api')->user()->load('roles');

        return $this->success(new UserResource($user), 'Profile fetched.');
    }

    public function logout(): JsonResponse
    {
        $this->auth->logout();

        return $this->noContent('Logged out.');
    }

    public function refresh(): JsonResponse
    {
        $result = $this->auth->refresh();

        return $this->respondWithToken($result, 'Token refreshed.');
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $message = $this->auth->sendResetLink($request->string('email'));

        return $this->success(null, $message);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $message = $this->auth->resetPassword($request->validated());

        return $this->success(null, $message);
    }

    private function respondWithToken(array $result, string $message, int $status = 200): JsonResponse
    {
        return $this->success([
            'user' => new UserResource($result['user']),
            'token' => $result['token'],
            'token_type' => $result['token_type'],
            'expires_in' => $result['expires_in'],
        ], $message, $status);
    }
}
