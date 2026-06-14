<?php

namespace App\Filament\Resources;

use App\Filament\Resources\LeadResource\Pages;
use App\Models\Lead;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class LeadResource extends Resource
{
    protected static ?string $model = Lead::class;

    protected static ?string $navigationIcon = 'heroicon-o-inbox-arrow-down';

    protected static ?string $navigationGroup = 'Content';

    protected static ?int $navigationSort = 2;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->searchable()->sortable(),
                TextColumn::make('email')->searchable()->toggleable(),
                TextColumn::make('phone')->searchable()->toggleable(),
                TextColumn::make('card.full_name')->label('Card')->searchable(),
                TextColumn::make('card.user.name')->label('Owner')->toggleable(),
                IconColumn::make('is_read')->boolean()->label('Read'),
                TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                TernaryFilter::make('is_read'),
            ])
            ->actions([ViewAction::make()])
            ->defaultSort('created_at', 'desc');
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            TextEntry::make('name'),
            TextEntry::make('email')->placeholder('—'),
            TextEntry::make('phone')->placeholder('—'),
            TextEntry::make('card.full_name')->label('Card'),
            TextEntry::make('source'),
            TextEntry::make('message')->columnSpanFull()->placeholder('—'),
            TextEntry::make('created_at')->dateTime(),
        ])->columns(2);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListLeads::route('/'),
        ];
    }
}
