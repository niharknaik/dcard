<?php

namespace App\Services;

use App\Mail\WelcomeMail;
use App\Models\Setting;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthService
{
    public function __construct(
        private readonly UserRepositoryInterface $users,
        private readonly RewardService $rewards,
        private readonly ReferralService $referrals,
    ) {}

    /**
     * Register a new user, assign the default role, and queue the welcome email.
     */
    public function register(array $data): array
    {
        if (! Setting::get('signups_enabled', true)) {
            throw ValidationException::withMessages([
                'email' => ['New registrations are currently closed.'],
            ]);
        }

        $user = DB::transaction(function () use ($data) {
            $user = $this->users->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => $data['password'], // hashed via model cast
                'consent_accepted_at' => now(),
            ]);

            $user->assignRole('user');

            return $user;
        });

        // Rewards & referrals: every user gets a wallet + referral code.
        $this->rewards->walletFor($user);
        $this->referrals->ensureCode($user);
        $this->referrals->awardSignupBonus($user);
        $this->referrals->attachReferral($user, $data['referral_code'] ?? null);

        Mail::to($user->email)->queue(new WelcomeMail($user));

        $token = JWTAuth::fromUser($user);

        return $this->tokenPayload($user, $token);
    }

    /**
     * Attempt login and issue a JWT.
     *
     * @throws ValidationException
     */
    public function login(string $email, string $password): array
    {
        $token = Auth::guard('api')->attempt(['email' => $email, 'password' => $password]);

        if (! $token) {
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        /** @var User $user */
        $user = Auth::guard('api')->user();

        if (! $user->isActive()) {
            Auth::guard('api')->logout();
            throw ValidationException::withMessages([
                'email' => ['Your account has been suspended.'],
            ]);
        }

        $this->users->update($user, [
            'last_login_at' => now(),
            'last_login_ip' => request()->ip(),
        ]);

        return $this->tokenPayload($user, $token);
    }

    public function logout(): void
    {
        Auth::guard('api')->logout();
    }

    public function refresh(): array
    {
        $token = Auth::guard('api')->refresh();
        $user = Auth::guard('api')->setToken($token)->user();

        return $this->tokenPayload($user, $token);
    }

    /**
     * Send the password reset link (queued by the notification).
     */
    public function sendResetLink(string $email): string
    {
        $status = Password::sendResetLink(['email' => $email]);

        return __($status);
    }

    /**
     * Reset the password using the emailed token.
     *
     * @throws ValidationException
     */
    public function resetPassword(array $data): string
    {
        $status = Password::reset($data, function (User $user, string $password) {
            $user->forceFill([
                'password' => $password,
                'remember_token' => Str::random(60),
            ])->save();

            event(new PasswordReset($user));
        });

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return __($status);
    }

    public function changePassword(User $user, string $current, string $new): void
    {
        if (! Hash::check($current, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $this->users->update($user, ['password' => $new]);
    }

    private function tokenPayload(User $user, string $token): array
    {
        return [
            'user' => $user,
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => (int) config('jwt.ttl') * 60,
        ];
    }
}
