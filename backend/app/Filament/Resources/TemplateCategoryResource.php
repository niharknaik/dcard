<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TemplateCategoryResource\Pages;
use App\Models\TemplateCategory;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Forms\Set;
use Filament\Resources\Resource;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class TemplateCategoryResource extends Resource
{
    protected static ?string $model = TemplateCategory::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-group';

    protected static ?string $navigationGroup = 'Marketplace';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form->schema([
            TextInput::make('name')->required()->maxLength(80)
                ->live(onBlur: true)
                ->afterStateUpdated(fn (Set $set, ?string $state) => $set('slug', Str::slug((string) $state))),
            TextInput::make('slug')->required()->unique(ignoreRecord: true),
            TextInput::make('icon')->helperText('Heroicon name, e.g. heroicon-o-briefcase'),
            Textarea::make('description')->rows(2)->columnSpanFull(),
            Toggle::make('is_active')->default(true),
            TextInput::make('sort_order')->numeric()->default(0),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->searchable()->sortable(),
                TextColumn::make('slug')->badge(),
                TextColumn::make('templates_count')->counts('templates')->label('Templates'),
                IconColumn::make('is_active')->boolean(),
                TextColumn::make('sort_order')->sortable(),
            ])
            ->actions([EditAction::make(), DeleteAction::make()])
            ->defaultSort('sort_order');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ManageTemplateCategories::route('/'),
        ];
    }
}
