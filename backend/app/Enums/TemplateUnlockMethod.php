<?php

namespace App\Enums;

enum TemplateUnlockMethod: string
{
    case Free   = 'free';
    case Points = 'points';
    case Money  = 'money';
    case Mixed  = 'mixed';

    public function label(): string
    {
        return match ($this) {
            self::Free   => 'Free',
            self::Points => 'Reward Points',
            self::Money  => 'Money',
            self::Mixed  => 'Money + Reward Points',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
