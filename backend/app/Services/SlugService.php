<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SlugService
{
    /**
     * Generate a unique, SEO-friendly slug for a table/column, appending an
     * incrementing suffix on collision (john-doe, john-doe-2, ...).
     */
    public function unique(string $value, string $table = 'cards', string $column = 'slug', ?int $ignoreId = null): string
    {
        $base = Str::slug($value);

        if ($base === '') {
            $base = Str::lower(Str::random(8));
        }

        $slug = $base;
        $suffix = 1;

        while ($this->exists($slug, $table, $column, $ignoreId)) {
            $suffix++;
            $slug = "{$base}-{$suffix}";
        }

        return $slug;
    }

    private function exists(string $slug, string $table, string $column, ?int $ignoreId): bool
    {
        return DB::table($table)
            ->where($column, $slug)
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->exists();
    }
}
