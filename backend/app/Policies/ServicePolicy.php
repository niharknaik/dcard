<?php

namespace App\Policies;

use App\Models\Service;
use App\Models\User;

class ServicePolicy
{
    public function update(User $user, Service $service): bool
    {
        return $service->card->user_id === $user->id;
    }

    public function delete(User $user, Service $service): bool
    {
        return $service->card->user_id === $user->id;
    }
}
