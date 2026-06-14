<?php

namespace App\Repositories;

use App\Models\Card;
use App\Repositories\Contracts\CardRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CardRepository implements CardRepositoryInterface
{
    public function paginateForUser(int $userId, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return Card::query()
            ->forUser($userId)
            ->withCount(['socialLinks', 'leads'])
            ->when(
                $filters['search'] ?? null,
                fn ($q, $search) => $q->where(fn ($w) => $w
                    ->where('full_name', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%"))
            )
            ->when(
                ($filters['is_published'] ?? null) !== null,
                fn ($q) => $q->where('is_published', (bool) $filters['is_published'])
            )
            ->latest()
            ->paginate($perPage);
    }

    public function findForUser(int $id, int $userId): ?Card
    {
        return Card::forUser($userId)->find($id);
    }

    public function findPublishedBySlug(string $slug): ?Card
    {
        return Card::published()
            ->with([
                'socialLinks' => fn ($q) => $q->where('is_active', true),
                'services' => fn ($q) => $q->where('is_active', true),
                'portfolioItems',
                'template',
            ])
            ->where('slug', $slug)
            ->first();
    }

    public function create(array $data): Card
    {
        return Card::create($data);
    }

    public function update(Card $card, array $data): Card
    {
        $card->fill($data)->save();

        return $card->refresh();
    }

    public function delete(Card $card): void
    {
        $card->delete();
    }
}
