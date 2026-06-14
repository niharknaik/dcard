<?php

namespace App\Filament\Resources\AdResource\Pages;

use App\Filament\Resources\AdResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageAds extends ManageRecords
{
    protected static string $resource = AdResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
