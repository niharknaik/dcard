<?php

namespace App\Filament\Resources;

use App\Enums\RewardSource;
use App\Filament\Resources\RewardWalletResource\Pages;
use App\Models\RewardWallet;
use App\Services\RewardService;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables\Actions\Action;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class RewardWalletResource extends Resource
{
    protected static ?string $model = RewardWallet::class;

    protected static ?string $navigationIcon = 'heroicon-o-wallet';

    protected static ?string $navigationGroup = 'Rewards';

    protected static ?int $navigationSort = 1;

    protected static ?string $navigationLabel = 'User Wallets';

    public static function canCreate(): bool
    {
        return false;
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('user.name')->label('User')->searchable()->sortable(),
                TextColumn::make('user.email')->searchable()->toggleable(),
                TextColumn::make('balance')->sortable()->badge()->color('success'),
                TextColumn::make('lifetime_earned')->label('Earned')->sortable(),
                TextColumn::make('lifetime_redeemed')->label('Redeemed')->sortable(),
                TextColumn::make('updated_at')->since()->label('Last activity'),
            ])
            ->actions([
                Action::make('addPoints')
                    ->icon('heroicon-o-plus-circle')
                    ->color('success')
                    ->form([
                        TextInput::make('points')->numeric()->minValue(1)->required(),
                        Textarea::make('description')->rows(2)->default('Admin reward'),
                    ])
                    ->action(function (RewardWallet $record, array $data) {
                        app(RewardService::class)->credit(
                            $record->user,
                            RewardSource::Admin,
                            (int) $data['points'],
                            $data['description'] ?: 'Admin reward',
                        );
                        Notification::make()->title('Points added')->success()->send();
                    }),
                Action::make('deductPoints')
                    ->icon('heroicon-o-minus-circle')
                    ->color('danger')
                    ->form([
                        TextInput::make('points')->numeric()->minValue(1)->required(),
                        Textarea::make('description')->rows(2)->default('Admin adjustment'),
                    ])
                    ->action(function (RewardWallet $record, array $data) {
                        app(RewardService::class)->debit(
                            $record->user,
                            RewardSource::Adjustment,
                            (int) $data['points'],
                            $data['description'] ?: 'Admin adjustment',
                        );
                        Notification::make()->title('Points deducted')->success()->send();
                    }),
            ])
            ->defaultSort('balance', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListRewardWallets::route('/'),
        ];
    }
}
