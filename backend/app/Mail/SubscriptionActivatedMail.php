<?php

namespace App\Mail;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SubscriptionActivatedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public SubscriptionPlan $plan,
        public Subscription $subscription,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Your '.$this->plan->name.' plan is active');
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.subscription-activated',
            with: [
                'name' => $this->user->name,
                'planName' => $this->plan->name,
                'endsAt' => $this->subscription->ends_at?->toFormattedDateString(),
            ],
        );
    }
}
