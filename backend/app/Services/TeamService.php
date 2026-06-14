<?php

namespace App\Services;

use App\Models\Card;
use App\Models\CardAnalyticsDaily;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TeamService
{
    /** Get (or lazily create) the owner's team. */
    public function teamFor(User $owner): Team
    {
        return Team::firstOrCreate(
            ['owner_id' => $owner->id],
            ['name' => $owner->name."'s Team"],
        );
    }

    public function members(User $owner): Collection
    {
        return $this->teamFor($owner)->members()->with('user:id,name,email,status')->get();
    }

    /**
     * Create an employee user account and attach them to the owner's team.
     */
    public function addEmployee(User $owner, array $data): TeamMember
    {
        if (User::where('email', $data['email'])->exists()) {
            throw ValidationException::withMessages(['email' => ['This email is already registered.']]);
        }

        return DB::transaction(function () use ($owner, $data) {
            $team = $this->teamFor($owner);

            $employee = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'], // hashed via cast
                'status' => 'active',
                'email_verified_at' => now(),
            ]);
            $employee->assignRole(($data['role'] ?? null) === 'manager' ? 'manager' : 'user');

            return $team->members()->create([
                'user_id' => $employee->id,
                'role' => $data['role'] ?? 'member',
                'position' => $data['position'] ?? null,
                'status' => 'active',
                'joined_at' => now(),
            ])->load('user:id,name,email,status');
        });
    }

    public function removeMember(User $owner, TeamMember $member): void
    {
        $team = $this->teamFor($owner);

        abort_unless($member->team_id === $team->id, 403, 'This member does not belong to your team.');

        DB::transaction(function () use ($member) {
            // Suspend the employee's account, then detach from the team.
            $member->user?->update(['status' => 'suspended']);
            $member->delete();
        });
    }

    /**
     * Team-wide analytics across the owner's + employees' cards (last 30 days).
     */
    public function analytics(User $owner): array
    {
        $team = $this->teamFor($owner);

        $memberUserIds = $team->members()->pluck('user_id')->push($owner->id)->unique();

        $cards = Card::whereIn('user_id', $memberUserIds)->get(['id', 'user_id', 'full_name', 'views_count']);
        $cardIds = $cards->pluck('id');

        $from = now()->subDays(29)->toDateString();

        $totals = CardAnalyticsDaily::whereIn('card_id', $cardIds)
            ->where('date', '>=', $from)
            ->selectRaw('COALESCE(SUM(views),0) as views, COALESCE(SUM(unique_visitors),0) as unique_visitors,
                COALESCE(SUM(qr_scans),0) as qr_scans, COALESCE(SUM(link_clicks),0) as link_clicks')
            ->first();

        return [
            'team' => ['id' => $team->id, 'name' => $team->name],
            'members' => $team->members()->count(),
            'cards' => $cards->count(),
            'totals' => [
                'views' => (int) ($totals->views ?? 0),
                'unique_visitors' => (int) ($totals->unique_visitors ?? 0),
                'qr_scans' => (int) ($totals->qr_scans ?? 0),
                'link_clicks' => (int) ($totals->link_clicks ?? 0),
                'all_time_views' => (int) $cards->sum('views_count'),
            ],
        ];
    }
}
