<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BannerResource\Pages;
use App\Models\Banner;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class BannerResource extends Resource
{
    protected static ?string $model = Banner::class;

    protected static ?string $navigationIcon = 'heroicon-o-megaphone';

    protected static ?string $navigationGroup = 'CMS';

    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form->schema([
            TextInput::make('title')->required()->maxLength(160),
            FileUpload::make('image')->image()->disk('public')->directory('banners')->required(),
            TextInput::make('link')->url()->maxLength(255),
            Toggle::make('is_active')->default(true),
            TextInput::make('sort_order')->numeric()->default(0),
            DateTimePicker::make('starts_at'),
            DateTimePicker::make('ends_at'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('image')->disk('public'),
                TextColumn::make('title')->searchable(),
                IconColumn::make('is_active')->boolean(),
                TextColumn::make('starts_at')->dateTime()->placeholder('—')->toggleable(),
                TextColumn::make('ends_at')->dateTime()->placeholder('—')->toggleable(),
                TextColumn::make('sort_order')->sortable(),
            ])
            ->actions([EditAction::make(), DeleteAction::make()])
            ->defaultSort('sort_order');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ManageBanners::route('/'),
        ];
    }
}
