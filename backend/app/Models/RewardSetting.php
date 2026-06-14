<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

/**
 * Admin-editable reward rules (referral points, signup bonus, redemption rules),
 * read through a forever cache. Mirrors the Setting model contract.
 */
class RewardSetting extends Model
{
    protected $fillable = ['key', 'value', 'type', 'group', 'label'];

    private const CACHE_KEY = 'reward_settings.all';

    /** Read a setting, cast to its stored type. */
    public static function get(string $key, mixed $default = null): mixed
    {
        $all = static::cached();

        if (! array_key_exists($key, $all)) {
            return $default;
        }

        return static::castValue($all[$key]['value'], $all[$key]['type']);
    }

    /** Convenience: read an integer points value. */
    public static function points(string $key, int $default = 0): int
    {
        return (int) static::get($key, $default);
    }

    /** Write a setting and bust the cache. */
    public static function set(string $key, mixed $value, string $type = 'int', ?string $group = null, ?string $label = null): void
    {
        $row = static::firstOrNew(['key' => $key]);
        $row->type = $type ?: $row->type ?: 'int';
        $row->group = $group ?? $row->group;
        $row->label = $label ?? $row->label;
        $row->value = match (true) {
            is_bool($value) => $value ? '1' : '0',
            is_null($value) => null,
            default => (string) $value,
        };
        $row->save();

        static::flush();
    }

    public static function flush(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * @return array<string, array{value: ?string, type: string}>
     */
    private static function cached(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, fn () => static::all()
            ->keyBy('key')
            ->map(fn (self $s) => ['value' => $s->value, 'type' => $s->type])
            ->toArray());
    }

    private static function castValue(?string $value, string $type): mixed
    {
        return match ($type) {
            'bool' => filter_var($value, FILTER_VALIDATE_BOOL),
            'int'  => (int) $value,
            default => $value,
        };
    }
}
