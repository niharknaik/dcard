<?php

namespace App\Enums;

enum ContentReportStatus: string
{
    case Pending   = 'pending';
    case Reviewing = 'reviewing';
    case Actioned  = 'actioned';
    case Dismissed = 'dismissed';

    public function label(): string
    {
        return match ($this) {
            self::Pending   => 'Pending',
            self::Reviewing => 'Reviewing',
            self::Actioned  => 'Actioned',
            self::Dismissed => 'Dismissed',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /** value => label map for Filament/select usage. */
    public static function options(): array
    {
        return array_reduce(
            self::cases(),
            fn (array $carry, self $case) => $carry + [$case->value => $case->label()],
            [],
        );
    }
}
