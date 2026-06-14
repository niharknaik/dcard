<?php

namespace App\Filament\Resources\SubscriptionResource\Pages;

use App\Filament\Resources\SubscriptionResource;
use App\Filament\Support\ExportsTableToCsv;
use Filament\Resources\Pages\ListRecords;

class ListSubscriptions extends ListRecords
{
    use ExportsTableToCsv;

    protected static string $resource = SubscriptionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            $this->csvExportAction('subscriptions', [
                'User' => fn ($s) => $s->user?->name,
                'Plan' => fn ($s) => $s->plan?->name,
                'Status' => fn ($s) => $s->status->value ?? $s->status,
                'Starts' => fn ($s) => $s->starts_at?->toDateString(),
                'Ends' => fn ($s) => $s->ends_at?->toDateString(),
            ]),
        ];
    }
}
