<?php

namespace App\Mail;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SubscriptionExpiryMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public User $user, public Subscription $subscription) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Your subscription is expiring soon');
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.subscription-expiry',
            with: [
                'name' => $this->user->name,
                'endsAt' => $this->subscription->ends_at?->toFormattedDateString(),
            ],
        );
    }
}
