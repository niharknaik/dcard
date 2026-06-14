<?php

namespace App\Filament\Resources;

use App\Enums\RewardSource;
use App\Enums\RewardTransactionType;
use App\Filament\Resources\RewardTransactionResource\Pages;
use App\Models\RewardTransaction;
use Filament\Resources\Resource;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class RewardTransactionResource extends Resource
{
    protected static ?string $model = RewardTransaction::class;

    protected static ?string $navigationIcon = 'heroicon-o-arrows-right-left';

    protected static ?string $navigationGroup = 'Rewards';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Point Transactions';

    public static function canCreate(): bool
    {
        return false;
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('created_at')->dateTime()->sortable(),
                TextColumn::make('user.name')->label('User')->searchable()->sortable(),
                TextColumn::make('type')
                    ->badge()
                    ->formatStateUsing(fn ($state) => ucfirst($state instanceof RewardTransactionType ? $state->value : (string) $state))
                    ->color(fn ($state) => ($state instanceof RewardTransactionType ? $state : RewardTransactionType::tryFrom((string) $state)) === RewardTransactionType::Credit ? 'success' : 'danger'),
                TextColumn::make('source')
                    ->badge()
                    ->formatStateUsing(fn ($state) => ($state instanceof RewardSource ? $state : RewardSource::tryFrom((string) $state))?->label() ?? (string) $state),
                TextColumn::make('points')->sortable(),
                TextColumn::make('balance_after')->label('Balance')->sortable(),
                TextColumn::make('description')->limit(40)->toggleable(),
            ])
            ->filters([
                SelectFilter::make('type')->options([
                    'credit' => 'Credit',
                    'debit'  => 'Debit',
                ]),
                SelectFilter::make('source')->options(
                    collect(RewardSource::cases())->mapWithKeys(fn ($c) => [$c->value => $c->label()])->all()
                ),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListRewardTransactions::route('/'),
        ];
    }
}
