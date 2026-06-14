<?php

namespace App\Filament\Resources;

use App\Filament\Concerns\SuperAdminOnly;
use App\Filament\Resources\RoleResource\Pages;
use App\Models\ActivityLog;
use App\Models\Role;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class RoleResource extends Resource
{
    use SuperAdminOnly;

    /** Built-in roles that must never be renamed or deleted. */
    public const PROTECTED_ROLES = ['super_admin', 'admin', 'user', 'manager'];

    protected static ?string $model = Role::class;

    protected static ?string $navigationIcon = 'heroicon-o-shield-check';

    protected static ?string $navigationGroup = 'Access Control';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            TextInput::make('name')
                ->required()
                ->alphaDash()
                ->unique(ignoreRecord: true)
                ->helperText('Machine name, e.g. content_editor')
                ->disabled(fn (?Role $record) => $record && in_array($record->name, self::PROTECTED_ROLES, true))
                ->dehydrated(),
            TextInput::make('label')->required()->maxLength(120),
            Textarea::make('description')->rows(2)->columnSpanFull(),
            CheckboxList::make('permissions')
                ->relationship('permissions', 'label')
                ->searchable()
                ->bulkToggleable()
                ->columns(2)
                ->gridDirection('row')
                ->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->badge()->searchable()->sortable(),
                TextColumn::make('label')->searchable(),
                TextColumn::make('permissions_count')->counts('permissions')->label('Permissions'),
                TextColumn::make('users_count')->counts('users')->label('Users'),
                TextColumn::make('description')->limit(50)->toggleable(),
            ])
            ->actions([
                EditAction::make(),
                DeleteAction::make()
                    ->visible(fn (Role $record) => ! in_array($record->name, self::PROTECTED_ROLES, true))
                    ->after(fn (Role $record) => ActivityLog::record(
                        'role.deleted',
                        null,
                        "Deleted role '{$record->name}'",
                    )),
            ])
            ->defaultSort('id');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ManageRoles::route('/'),
        ];
    }
}
