<?php

namespace App\Policies;

use App\Models\Lead;
use App\Models\User;

class LeadPolicy
{
    public function view(User $user, Lead $lead): bool
    {
        return $this->owns($user, $lead);
    }

    public function update(User $user, Lead $lead): bool
    {
        return $this->owns($user, $lead);
    }

    private function owns(User $user, Lead $lead): bool
    {
        return $lead->card->user_id === $user->id;
    }
}
