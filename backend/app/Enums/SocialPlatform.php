<?php

namespace App\Enums;

enum SocialPlatform: string
{
    case WhatsApp  = 'whatsapp';
    case Instagram = 'instagram';
    case Facebook  = 'facebook';
    case LinkedIn  = 'linkedin';
    case YouTube   = 'youtube';
    case X         = 'x';
    case Telegram  = 'telegram';
    case GitHub    = 'github';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
