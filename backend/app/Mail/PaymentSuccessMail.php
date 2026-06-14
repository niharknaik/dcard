<?php

namespace App\Mail;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentSuccessMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Payment $payment) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Payment received — '.config('app.name'));
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.payment-success',
            with: [
                'payment' => $this->payment,
                'planName' => $this->payment->plan?->name,
            ],
        );
    }
}
