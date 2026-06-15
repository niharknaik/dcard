<?php

namespace App\Enums;

enum ContentReportReason: string
{
    case Spam          = 'spam';
    case Abuse         = 'abuse';
    case Illegal       = 'illegal';
    case Impersonation = 'impersonation';
    case Other         = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Spam          => 'Spam or misleading',
            self::Abuse         => 'Abusive or hateful content',
            self::Illegal       => 'Illegal content',
            self::Impersonation => 'Impersonation',
            self::Other         => 'Other',
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
