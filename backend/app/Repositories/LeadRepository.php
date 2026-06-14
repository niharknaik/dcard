<?php

namespace App\Repositories;

use App\Models\Lead;
use App\Repositories\Contracts\LeadRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class LeadRepository implements LeadRepositoryInterface
{
    public function paginateForUser(int $userId, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->queryForUser($userId, $filters)
            ->with('card:id,full_name,slug')
            ->latest()
            ->paginate($perPage);
    }

    public function queryForUser(int $userId, array $filters = []): Builder
    {
        return Lead::query()
            ->whereHas('card', fn (Builder $q) => $q->where('user_id', $userId))
            ->when(
                isset($filters['card_id']),
                fn (Builder $q) => $q->where('card_id', $filters['card_id'])
            )
            ->when(
                array_key_exists('is_read', $filters) && $filters['is_read'] !== null,
                fn (Builder $q) => $q->where('is_read', (bool) $filters['is_read'])
            )
            ->when(
                $filters['search'] ?? null,
                fn (Builder $q, $search) => $q->where(fn (Builder $w) => $w
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%"))
            );
    }

    public function create(array $data): Lead
    {
        return Lead::create($data);
    }
}
