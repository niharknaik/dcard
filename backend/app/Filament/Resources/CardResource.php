<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CardResource\Pages;
use App\Models\Card;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class CardResource extends Resource
{
    protected static ?string $model = Card::class;

    protected static ?string $navigationIcon = 'heroicon-o-identification';

    protected static ?string $navigationGroup = 'Content';

    protected static ?int $navigationSort = 1;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('full_name')->searchable()->sortable(),
                TextColumn::make('slug')->searchable()->copyable(),
                TextColumn::make('user.name')->label('Owner')->searchable(),
                TextColumn::make('company')->toggleable(),
                IconColumn::make('is_published')->boolean(),
                TextColumn::make('views_count')->label('Views')->sortable(),
                TextColumn::make('leads_count')->counts('leads')->label('Leads'),
                TextColumn::make('created_at')->dateTime()->sortable()->toggleable(),
            ])
            ->filters([
                TernaryFilter::make('is_published'),
            ])
            ->actions([ViewAction::make()])
            ->defaultSort('created_at', 'desc');
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            TextEntry::make('full_name'),
            TextEntry::make('slug')->copyable(),
            TextEntry::make('user.name')->label('Owner'),
            TextEntry::make('designation')->placeholder('—'),
            TextEntry::make('company')->placeholder('—'),
            TextEntry::make('phone')->placeholder('—'),
            TextEntry::make('email')->placeholder('—'),
            TextEntry::make('views_count')->label('Views'),
            TextEntry::make('about')->columnSpanFull()->placeholder('—'),
        ])->columns(2);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCards::route('/'),
        ];
    }
}
