<?php

namespace App\Filament\Resources\UserResource\Pages;

use App\Filament\Resources\UserResource;
use Filament\Actions\EditAction;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;
use Filament\Resources\Pages\ViewRecord;

class ViewUser extends ViewRecord
{
    protected static string $resource = UserResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }

    public function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            TextEntry::make('name'),
            TextEntry::make('email')->copyable(),
            TextEntry::make('phone'),
            TextEntry::make('status')->badge()
                ->color(fn (string $state) => $state === 'active' ? 'success' : 'danger'),
            TextEntry::make('cards_count')->label('Total cards')
                ->state(fn ($record) => $record->cards()->count()),
            TextEntry::make('leads')->label('Total leads')
                ->state(fn ($record) => \App\Models\Lead::whereHas('card', fn ($q) => $q->where('user_id', $record->id))->count()),
            TextEntry::make('created_at')->dateTime(),
        ]);
    }
}
