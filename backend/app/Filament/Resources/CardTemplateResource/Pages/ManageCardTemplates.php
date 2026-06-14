<?php

namespace App\Filament\Resources\CardTemplateResource\Pages;

use App\Filament\Resources\CardTemplateResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageCardTemplates extends ManageRecords
{
    protected static string $resource = CardTemplateResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
