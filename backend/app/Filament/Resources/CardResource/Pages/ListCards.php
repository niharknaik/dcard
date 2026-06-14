<?php

namespace App\Filament\Resources\CardResource\Pages;

use App\Filament\Resources\CardResource;
use App\Filament\Support\ExportsTableToCsv;
use Filament\Resources\Pages\ListRecords;

class ListCards extends ListRecords
{
    use ExportsTableToCsv;

    protected static string $resource = CardResource::class;

    protected function getHeaderActions(): array
    {
        return [
            $this->csvExportAction('cards', [
                'Name' => fn ($c) => $c->full_name,
                'Slug' => fn ($c) => $c->slug,
                'Owner' => fn ($c) => $c->user?->name,
                'Company' => fn ($c) => $c->company,
                'Published' => fn ($c) => $c->is_published ? 'Yes' : 'No',
                'Views' => fn ($c) => $c->views_count,
                'Created' => fn ($c) => $c->created_at?->toDateTimeString(),
            ]),
        ];
    }
}
