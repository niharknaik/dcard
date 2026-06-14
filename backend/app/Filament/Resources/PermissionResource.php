<?php

namespace App\Filament\Resources;

use App\Filament\Concerns\SuperAdminOnly;
use App\Filament\Resources\PermissionResource\Pages;
use App\Models\Permission;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Resources\Resource;
use Filament\Tables\Table;

class PermissionResource extends Resource
{
    use SuperAdminOnly;

    protected static ?string $model = Permission::class;

    protected static ?string $navigationIcon = 'heroicon-o-key';

    protected static ?string $navigationGroup = 'Access Control';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form->schema([
            TextInput::make('name')
                ->required()
                ->unique(ignoreRecord: true)
                ->helperText('Dotted name, e.g. users.manage'),
            TextInput::make('label')->required()->maxLength(120),
            TextInput::make('group')->maxLength(60)->helperText('Module grouping, e.g. users'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->searchable()->sortable()->copyable(),
                TextColumn::make('label')->searchable(),
                TextColumn::make('group')->badge()->sortable(),
                TextColumn::make('roles_count')->counts('roles')->label('Roles'),
            ])
            ->filters([
                SelectFilter::make('group')->options(
                    fn () => Permission::query()->whereNotNull('group')->distinct()->pluck('group', 'group')->all()
                ),
            ])
            ->actions([EditAction::make(), DeleteAction::make()])
            ->defaultGroup('group')
            ->defaultSort('name');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ManagePermissions::route('/'),
        ];
    }
}
