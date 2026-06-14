<?php

namespace App\Policies;

use App\Models\SocialLink;
use App\Models\User;

class SocialLinkPolicy
{
    public function update(User $user, SocialLink $link): bool
    {
        return $this->owns($user, $link);
    }

    public function delete(User $user, SocialLink $link): bool
    {
        return $this->owns($user, $link);
    }

    private function owns(User $user, SocialLink $link): bool
    {
        return $link->card->user_id === $user->id;
    }
}
