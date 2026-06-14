<?php

namespace App\Mail;

use App\Models\Lead;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewLeadMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Lead $lead) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'New lead on your card: '.$this->lead->card->full_name);
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.new-lead',
            with: [
                'lead' => $this->lead,
                'cardName' => $this->lead->card->full_name,
            ],
        );
    }
}
