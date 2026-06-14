<?php

namespace App\Enums;

enum RewardSource: string
{
    case Referral           = 'referral';
    case SignupBonus        = 'signup_bonus';
    case Promotional        = 'promotional';
    case Admin              = 'admin';
    case TemplateRedemption = 'template_redemption';
    case Adjustment         = 'adjustment';

    public function label(): string
    {
        return match ($this) {
            self::Referral           => 'Referral Reward',
            self::SignupBonus        => 'Signup Bonus',
            self::Promotional        => 'Promotional Reward',
            self::Admin              => 'Admin Reward',
            self::TemplateRedemption => 'Template Redemption',
            self::Adjustment         => 'Adjustment',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
