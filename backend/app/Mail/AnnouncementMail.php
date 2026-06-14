<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AnnouncementMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $announcementTitle,
        public string $announcementBody,
        public string $recipientName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->announcementTitle);
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.announcement',
            with: [
                'title' => $this->announcementTitle,
                'body' => $this->announcementBody,
                'name' => $this->recipientName,
                'appName' => config('app.name'),
            ],
        );
    }
}
