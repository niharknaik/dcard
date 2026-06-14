<?php

namespace App\Services;

use App\Models\Payment;
use Barryvdh\DomPDF\Facade\Pdf;
use Barryvdh\DomPDF\PDF as PdfInstance;

class InvoiceService
{
    public function pdf(Payment $payment): PdfInstance
    {
        $payment->loadMissing(['user', 'plan']);

        return Pdf::loadView('invoices.invoice', [
            'payment' => $payment,
            'appName' => config('app.name'),
        ])->setPaper('a4');
    }
}
