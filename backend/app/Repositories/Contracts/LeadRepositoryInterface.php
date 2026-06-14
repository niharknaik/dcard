<?php

namespace App\Repositories\Contracts;

use App\Models\Lead;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

interface LeadRepositoryInterface
{
    public function paginateForUser(int $userId, array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /** Query builder of a user's leads (across all their cards) for streaming exports. */
    public function queryForUser(int $userId, array $filters = []): Builder;

    public function create(array $data): Lead;
}
