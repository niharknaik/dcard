<?php

namespace App\Filament\Resources\ActivityLogResource\Pages;

use App\Filament\Resources\ActivityLogResource;
use App\Filament\Support\ExportsTableToCsv;
use Filament\Resources\Pages\ListRecords;

class ListActivityLogs extends ListRecords
{
    use ExportsTableToCsv;

    protected static string $resource = ActivityLogResource::class;

    protected function getHeaderActions(): array
    {
        return [
            $this->csvExportAction('activity-log', [
                'When' => fn ($r) => $r->created_at?->toDateTimeString(),
                'Actor' => fn ($r) => $r->user?->name ?? 'System',
                'Action' => fn ($r) => $r->action,
                'Description' => fn ($r) => $r->description,
                'Subject' => fn ($r) => $r->subject_type ? class_basename($r->subject_type).'#'.$r->subject_id : '',
                'IP' => fn ($r) => $r->ip_address,
            ]),
        ];
    }
}
