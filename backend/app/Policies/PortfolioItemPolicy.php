<?php

namespace App\Policies;

use App\Models\PortfolioItem;
use App\Models\User;

class PortfolioItemPolicy
{
    public function update(User $user, PortfolioItem $item): bool
    {
        return $item->card->user_id === $user->id;
    }

    public function delete(User $user, PortfolioItem $item): bool
    {
        return $item->card->user_id === $user->id;
    }
}
