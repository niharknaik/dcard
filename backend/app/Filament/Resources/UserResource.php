<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\ActivityLog;
use App\Models\User;
use Filament\Notifications\Notification;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Actions\Action;
use Filament\Tables\Actions\BulkActionGroup;
use Filament\Tables\Actions\DeleteBulkAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?string $navigationGroup = 'Users';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            TextInput::make('name')->required()->maxLength(120),
            TextInput::make('email')->email()->required()->unique(ignoreRecord: true),
            TextInput::make('phone')->tel()->maxLength(20),
            Select::make('status')
                ->options(['active' => 'Active', 'suspended' => 'Suspended'])
                ->default('active')
                ->required(),
            Toggle::make('is_admin')->label('Administrator'),
            Select::make('roles')
                ->relationship('roles', 'label')
                ->multiple()
                ->preload()
                ->visible(fn () => (bool) auth()->user()?->isSuperAdmin())
                ->helperText('RBAC roles — manageable by super admins only.'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->searchable()->sortable(),
                TextColumn::make('email')->searchable()->copyable(),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state) => $state === 'active' ? 'success' : 'danger'),
                IconColumn::make('is_admin')->boolean()->label('Admin'),
                TextColumn::make('roles.label')->badge()->label('Roles')->toggleable(),
                TextColumn::make('cards_count')->counts('cards')->label('Cards'),
                TextColumn::make('consent_accepted_at')->label('Consent given')->dateTime()->sortable()->toggleable(),
                TextColumn::make('created_at')->dateTime()->sortable()->toggleable(),
            ])
            ->filters([
                SelectFilter::make('status')->options(['active' => 'Active', 'suspended' => 'Suspended']),
                SelectFilter::make('roles')->relationship('roles', 'label')->label('Role'),
            ])
            ->actions([
                ViewAction::make(),
                EditAction::make(),
                Action::make('toggleStatus')
                    ->label(fn (User $record) => $record->status === 'active' ? 'Suspend' : 'Activate')
                    ->icon('heroicon-o-lock-closed')
                    ->color(fn (User $record) => $record->status === 'active' ? 'danger' : 'success')
                    ->requiresConfirmation()
                    ->action(function (User $record) {
                        $status = $record->status === 'active' ? 'suspended' : 'active';
                        $record->update(['status' => $status]);
                        ActivityLog::record(
                            'user.status_changed',
                            $record,
                            "Set status to {$status} for {$record->email}",
                            ['status' => $status],
                        );
                    }),
                Action::make('toggleSuperAdmin')
                    ->label(fn (User $record) => $record->isSuperAdmin() ? 'Revoke super admin' : 'Make super admin')
                    ->icon('heroicon-o-shield-exclamation')
                    ->color(fn (User $record) => $record->isSuperAdmin() ? 'danger' : 'warning')
                    ->visible(fn () => (bool) auth()->user()?->isSuperAdmin())
                    ->requiresConfirmation()
                    ->action(function (User $record) {
                        if ($record->isSuperAdmin()) {
                            $record->removeRole('super_admin');
                            ActivityLog::record('user.super_admin_revoked', $record, "Revoked super admin from {$record->email}");
                        } else {
                            $record->assignRole('super_admin');
                            $record->update(['is_admin' => true]);
                            ActivityLog::record('user.super_admin_granted', $record, "Granted super admin to {$record->email}");
                        }
                    }),
                Action::make('impersonate')
                    ->label('Impersonate')
                    ->icon('heroicon-o-finger-print')
                    ->color('gray')
                    ->visible(fn (User $record) => (bool) auth()->user()?->isSuperAdmin() && ! $record->isSuperAdmin())
                    ->requiresConfirmation()
                    ->modalHeading('Impersonate user')
                    ->modalDescription(fn (User $record) => "Generate a 15-minute access token to act as {$record->email} via the API.")
                    ->action(function (User $record) {
                        JWTAuth::factory()->setTTL(15); // minutes
                        $token = JWTAuth::customClaims(['impersonated_by' => auth()->id()])->fromUser($record);

                        ActivityLog::record('user.impersonated', $record, "Generated impersonation token for {$record->email}");

                        Notification::make()
                            ->title('Impersonation token — valid 15 minutes')
                            ->body($token)
                            ->persistent()
                            ->success()
                            ->send();
                    }),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->visible(fn () => (bool) auth()->user()?->isSuperAdmin()),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'view' => Pages\ViewUser::route('/{record}'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['name', 'email'];
    }

    public static function resolveRecordRouteBinding(int|string $key): ?Model
    {
        return static::getModel()::withCount('cards')->find($key);
    }
}
