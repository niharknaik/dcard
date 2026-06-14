<?php

namespace App\Filament\Resources\LeadResource\Pages;

use App\Filament\Resources\LeadResource;
use App\Filament\Support\ExportsTableToCsv;
use Filament\Resources\Pages\ListRecords;

class ListLeads extends ListRecords
{
    use ExportsTableToCsv;

    protected static string $resource = LeadResource::class;

    protected function getHeaderActions(): array
    {
        return [
            $this->csvExportAction('leads', [
                'Name' => fn ($l) => $l->name,
                'Email' => fn ($l) => $l->email,
                'Phone' => fn ($l) => $l->phone,
                'Card' => fn ($l) => $l->card?->full_name,
                'Message' => fn ($l) => $l->message,
                'Read' => fn ($l) => $l->is_read ? 'Yes' : 'No',
                'Created' => fn ($l) => $l->created_at?->toDateTimeString(),
            ]),
        ];
    }
}
