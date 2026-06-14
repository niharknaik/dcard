<?php

namespace App\Enums;

enum RewardTransactionType: string
{
    case Credit = 'credit';
    case Debit  = 'debit';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
