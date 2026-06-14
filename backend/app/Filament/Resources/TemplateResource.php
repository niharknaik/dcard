<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TemplateResource\Pages;
use App\Models\Template;
use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\KeyValue;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Forms\Set;
use Filament\Resources\Resource;
use Filament\Tables\Actions\BulkActionGroup;
use Filament\Tables\Actions\DeleteBulkAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class TemplateResource extends Resource
{
    protected static ?string $model = Template::class;

    protected static ?string $navigationIcon = 'heroicon-o-swatch';

    protected static ?string $navigationGroup = 'Marketplace';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Section::make('Template')->schema([
                Select::make('template_category_id')
                    ->label('Category')
                    ->relationship('category', 'name')
                    ->searchable()
                    ->preload()
                    ->required(),
                TextInput::make('name')->required()->maxLength(120)
                    ->live(onBlur: true)
                    ->afterStateUpdated(fn (Set $set, ?string $state) => $set('slug', Str::slug((string) $state))),
                TextInput::make('slug')->required()->unique(ignoreRecord: true),
                Textarea::make('description')->rows(2)->columnSpanFull(),
            ])->columns(3),

            Section::make('Media')->schema([
                FileUpload::make('thumbnail')
                    ->image()->disk('public')->directory('templates/thumbnails'),
                FileUpload::make('preview_images')
                    ->image()->multiple()->reorderable()
                    ->disk('public')->directory('templates/previews')
                    ->helperText('Up to a few preview screenshots shown on the template detail page.'),
            ])->columns(2),

            Section::make('Design')->schema([
                Select::make('layout')->options([
                    'classic' => 'Classic',
                    'hero'    => 'Hero',
                    'split'   => 'Split',
                    'minimal' => 'Minimal',
                    'gallery' => 'Gallery',
                ])->default('classic')->required(),
                ColorPicker::make('color_scheme')->label('Primary colour'),
                TextInput::make('font_family')->label('Custom font')->maxLength(60),
                KeyValue::make('config')
                    ->label('Advanced config (colours, fonts, layout, sections)')
                    ->columnSpanFull(),
            ])->columns(3),

            Section::make('Sections')->schema([
                Toggle::make('has_portfolio')->default(true),
                Toggle::make('has_contact')->default(true),
                Toggle::make('has_social')->default(true),
            ])->columns(3),

            Section::make('Pricing & visibility')->schema([
                Toggle::make('is_free')->label('Free template')
                    ->helperText('When on, the template unlocks instantly at no cost.'),
                TextInput::make('price')->numeric()->default(0)->prefix('₹')
                    ->helperText('Money price (INR).'),
                TextInput::make('price_points')->numeric()->default(0)->suffix('pts')
                    ->helperText('Reward-points price.'),
                Toggle::make('is_active')->default(true),
                TextInput::make('sort_order')->numeric()->default(0),
            ])->columns(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('thumbnail')->disk('public')->square(),
                TextColumn::make('name')->searchable()->sortable(),
                TextColumn::make('category.name')->badge()->sortable(),
                TextColumn::make('price')->money('INR')->sortable(),
                TextColumn::make('price_points')->suffix(' pts')->sortable(),
                IconColumn::make('is_free')->boolean()->label('Free'),
                ToggleColumn::make('is_active')->label('Active'),
                TextColumn::make('purchases_count')->label('Unlocks')->sortable(),
                TextColumn::make('usage_count')->label('In use')->sortable(),
            ])
            ->filters([
                SelectFilter::make('template_category_id')
                    ->label('Category')
                    ->relationship('category', 'name'),
                TernaryFilter::make('is_free')->label('Free'),
                TernaryFilter::make('is_active')->label('Active'),
            ])
            ->actions([EditAction::make()])
            ->bulkActions([BulkActionGroup::make([DeleteBulkAction::make()])])
            ->defaultSort('sort_order');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListTemplates::route('/'),
            'create' => Pages\CreateTemplate::route('/create'),
            'edit'   => Pages\EditTemplate::route('/{record}/edit'),
        ];
    }
}
