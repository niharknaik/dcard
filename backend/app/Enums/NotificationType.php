<?php

namespace App\Enums;

enum NotificationType: string
{
    case NewLead                = 'new_lead';
    case SubscriptionActivated  = 'subscription_activated';
    case SubscriptionExpiring   = 'subscription_expiring';
    case ViewMilestone          = 'view_milestone';
    case PaymentSuccess         = 'payment_success';
    case PaymentFailed          = 'payment_failed';
    case PaymentRefunded        = 'payment_refunded';
    case Announcement           = 'announcement';

    public function label(): string
    {
        return match ($this) {
            self::NewLead               => 'New Lead Received',
            self::SubscriptionActivated => 'Subscription Activated',
            self::SubscriptionExpiring  => 'Subscription Expiring',
            self::ViewMilestone         => 'Card View Milestone',
            self::PaymentSuccess        => 'Payment Successful',
            self::PaymentFailed         => 'Payment Failed',
            self::PaymentRefunded       => 'Payment Refunded',
            self::Announcement          => 'Announcement',
        };
    }
}
