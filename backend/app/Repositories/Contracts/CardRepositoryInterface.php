<?php

namespace App\Repositories\Contracts;

use App\Models\Card;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface CardRepositoryInterface
{
    public function paginateForUser(int $userId, array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function findForUser(int $id, int $userId): ?Card;

    public function findPublishedBySlug(string $slug): ?Card;

    public function create(array $data): Card;

    public function update(Card $card, array $data): Card;

    public function delete(Card $card): void;
}
