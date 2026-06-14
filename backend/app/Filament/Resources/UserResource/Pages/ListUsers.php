<?php

namespace App\Filament\Resources\UserResource\Pages;

use App\Filament\Resources\UserResource;
use App\Filament\Support\ExportsTableToCsv;
use Filament\Resources\Pages\ListRecords;

class ListUsers extends ListRecords
{
    use ExportsTableToCsv;

    protected static string $resource = UserResource::class;

    protected function getHeaderActions(): array
    {
        return [
            $this->csvExportAction('users', [
                'Name' => fn ($u) => $u->name,
                'Email' => fn ($u) => $u->email,
                'Phone' => fn ($u) => $u->phone,
                'Status' => fn ($u) => $u->status,
                'Admin' => fn ($u) => $u->is_admin ? 'Yes' : 'No',
                'Joined' => fn ($u) => $u->created_at?->toDateTimeString(),
            ]),
        ];
    }
}
