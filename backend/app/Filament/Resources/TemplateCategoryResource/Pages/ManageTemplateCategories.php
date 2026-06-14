<?php

namespace App\Filament\Resources\TemplateCategoryResource\Pages;

use App\Filament\Resources\TemplateCategoryResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageTemplateCategories extends ManageRecords
{
    protected static string $resource = TemplateCategoryResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
