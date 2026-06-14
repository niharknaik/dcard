<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CardTemplateResource\Pages;
use App\Models\CardTemplate;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\KeyValue;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Forms\Set;
use Filament\Resources\Resource;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class CardTemplateResource extends Resource
{
    protected static ?string $model = CardTemplate::class;

    protected static ?string $navigationIcon = 'heroicon-o-swatch';

    protected static ?string $navigationGroup = 'CMS';

    protected static ?int $navigationSort = 5;

    public static function form(Form $form): Form
    {
        return $form->schema([
            TextInput::make('name')->required()->maxLength(120)
                ->live(onBlur: true)
                ->afterStateUpdated(fn (Set $set, ?string $state) => $set('slug', Str::slug((string) $state))),
            TextInput::make('slug')->required()->unique(ignoreRecord: true),
            FileUpload::make('preview_image')->image()->disk('public')->directory('templates'),
            KeyValue::make('config')->label('Config (colors, fonts, layout)')->columnSpanFull(),
            Toggle::make('is_premium'),
            Toggle::make('is_active')->default(true),
            TextInput::make('sort_order')->numeric()->default(0),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('preview_image')->disk('public'),
                TextColumn::make('name')->searchable(),
                TextColumn::make('slug')->badge(),
                IconColumn::make('is_premium')->boolean(),
                IconColumn::make('is_active')->boolean(),
                TextColumn::make('cards_count')->counts('cards')->label('In use'),
            ])
            ->actions([EditAction::make(), DeleteAction::make()])
            ->defaultSort('sort_order');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ManageCardTemplates::route('/'),
        ];
    }
}
