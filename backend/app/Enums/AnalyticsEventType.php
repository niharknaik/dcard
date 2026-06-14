<?php

namespace App\Enums;

enum AnalyticsEventType: string
{
    case View            = 'view';
    case QrScan          = 'qr_scan';
    case ContactSave     = 'contact_save';
    case LinkClick       = 'link_click';
    case PortfolioClick  = 'portfolio_click';

    /** Maps an event type to its aggregate column in card_analytics_daily. */
    public function dailyColumn(): string
    {
        return match ($this) {
            self::View           => 'views',
            self::QrScan         => 'qr_scans',
            self::ContactSave    => 'contact_saves',
            self::LinkClick      => 'link_clicks',
            self::PortfolioClick => 'portfolio_clicks',
        };
    }
}
