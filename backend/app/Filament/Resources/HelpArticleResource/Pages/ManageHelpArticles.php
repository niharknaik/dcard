<?php

namespace App\Filament\Resources\HelpArticleResource\Pages;

use App\Filament\Resources\HelpArticleResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageHelpArticles extends ManageRecords
{
    protected static string $resource = HelpArticleResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
