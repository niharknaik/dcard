<?php

namespace App\Enums;

enum TemplatePurchaseStatus: string
{
    case Pending   = 'pending';
    case Completed = 'completed';
    case Failed    = 'failed';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
