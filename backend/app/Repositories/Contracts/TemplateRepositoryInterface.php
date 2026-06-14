<?php

namespace App\Repositories\Contracts;

use App\Models\Template;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface TemplateRepositoryInterface
{
    public function paginate(array $filters = [], int $perPage = 20): LengthAwarePaginator;

    public function findActive(int $id): ?Template;

    public function findActiveBySlug(string $slug): ?Template;
}
