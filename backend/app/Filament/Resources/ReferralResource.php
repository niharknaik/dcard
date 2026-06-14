<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ReferralResource\Pages;
use App\Models\Referral;
use Filament\Resources\Resource;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class ReferralResource extends Resource
{
    protected static ?string $model = Referral::class;

    protected static ?string $navigationIcon = 'heroicon-o-user-plus';

    protected static ?string $navigationGroup = 'Rewards';

    protected static ?int $navigationSort = 3;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('created_at')->dateTime()->sortable(),
                TextColumn::make('referrer.name')->label('Referrer')->searchable()->sortable(),
                TextColumn::make('referred.name')->label('Joined user')->searchable()->sortable(),
                TextColumn::make('referral_code')->badge(),
                TextColumn::make('points_awarded')->label('Points')->sortable(),
                TextColumn::make('status')->badge()
                    ->color(fn ($state) => $state === 'rewarded' ? 'success' : 'warning'),
            ])
            ->filters([
                SelectFilter::make('status')->options([
                    'rewarded' => 'Rewarded',
                    'pending'  => 'Pending',
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListReferrals::route('/'),
        ];
    }
}
