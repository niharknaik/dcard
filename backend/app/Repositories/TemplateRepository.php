<?php

namespace App\Repositories;

use App\Models\Template;
use App\Repositories\Contracts\TemplateRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TemplateRepository implements TemplateRepositoryInterface
{
    public function paginate(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return Template::query()
            ->active()
            ->with('category')
            ->when(
                $filters['category_id'] ?? null,
                fn ($q, $categoryId) => $q->where('template_category_id', $categoryId)
            )
            ->when(
                $filters['category_slug'] ?? null,
                fn ($q, $slug) => $q->whereHas('category', fn ($c) => $c->where('slug', $slug))
            )
            ->when(
                ($filters['is_free'] ?? null) !== null,
                fn ($q) => $q->where('is_free', (bool) $filters['is_free'])
            )
            ->when(
                $filters['search'] ?? null,
                fn ($q, $search) => $q->where(fn ($w) => $w
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%"))
            )
            ->orderBy('sort_order')
            ->latest('id')
            ->paginate($perPage);
    }

    public function findActive(int $id): ?Template
    {
        return Template::active()->with('category')->find($id);
    }

    public function findActiveBySlug(string $slug): ?Template
    {
        return Template::active()->with('category')->where('slug', $slug)->first();
    }
}
