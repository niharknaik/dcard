<?php

namespace App\Policies;

use App\Models\Card;
use App\Models\User;

class CardPolicy
{
    public function view(User $user, Card $card): bool
    {
        return $this->owns($user, $card);
    }

    public function update(User $user, Card $card): bool
    {
        return $this->owns($user, $card);
    }

    public function delete(User $user, Card $card): bool
    {
        return $this->owns($user, $card);
    }

    private function owns(User $user, Card $card): bool
    {
        return $card->user_id === $user->id;
    }
}
