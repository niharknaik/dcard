<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class UserService
{
    public function __construct(private readonly UserRepositoryInterface $users) {}

    public function updateProfile(User $user, array $data): User
    {
        if (isset($data['avatar'])) {
            // Replace previous avatar to avoid orphaned files.
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $data['avatar'] = $data['avatar']->store('avatars', 'public');
        }

        return $this->users->update($user, $data);
    }

    /**
     * Soft delete the account and detach relations. Heavy purge is deferred to a
     * queued job in later phases; here we revoke access immediately.
     */
    public function deleteAccount(User $user): void
    {
        DB::transaction(function () use ($user) {
            $user->roles()->detach();
            $this->users->delete($user); // soft delete
        });
    }
}
