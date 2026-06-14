<?php

namespace App\Filament\Resources\PaymentResource\Pages;

use App\Filament\Resources\PaymentResource;
use App\Filament\Support\ExportsTableToCsv;
use Filament\Resources\Pages\ListRecords;

class ListPayments extends ListRecords
{
    use ExportsTableToCsv;

    protected static string $resource = PaymentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            $this->csvExportAction('payments', [
                'Invoice' => fn ($p) => $p->invoice_number,
                'User' => fn ($p) => $p->user?->name,
                'Plan' => fn ($p) => $p->plan?->name,
                'Amount' => fn ($p) => $p->amount,
                'Currency' => fn ($p) => $p->currency,
                'Status' => fn ($p) => $p->status->value ?? $p->status,
                'Transaction' => fn ($p) => $p->transaction_id,
                'Paid At' => fn ($p) => $p->paid_at?->toDateTimeString(),
            ]),
        ];
    }
}
