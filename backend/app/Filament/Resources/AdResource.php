<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AdResource\Pages;
use App\Models\Ad;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class AdResource extends Resource
{
    protected static ?string $model = Ad::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-group';

    protected static ?string $navigationGroup = 'Marketing';

    protected static ?int $navigationSort = 1;

    private const PLACEMENTS = [
        'dashboard_top' => 'Dashboard (top banner)',
        'card_list' => 'Card list',
        'leads_top' => 'Leads (top banner)',
        'app_footer' => 'App-wide footer',
    ];

    private const AUDIENCES = [
        'all' => 'All free users',
        'free' => 'Free plan',
    ];

    public static function form(Form $form): Form
    {
        return $form->schema([
            Section::make('Creative')->schema([
                TextInput::make('title')->required()->maxLength(160)->columnSpanFull(),
                FileUpload::make('image')->image()->disk('public')->directory('ads')
                    ->imageEditor()
                    ->helperText('Recommended ratio ~16:5 (e.g. 640×200).')
                    ->columnSpanFull(),
                TextInput::make('link')->url()->maxLength(255)->label('Tap-through URL')->columnSpanFull(),
            ]),

            Section::make('Targeting & schedule')->schema([
                Select::make('placement')->options(self::PLACEMENTS)->required()->native(false),
                Select::make('audience')->options(self::AUDIENCES)->default('free')->required()->native(false),
                TextInput::make('priority')->numeric()->default(0)->helperText('Higher wins per placement.'),
                Toggle::make('is_active')->default(true),
                DateTimePicker::make('starts_at'),
                DateTimePicker::make('ends_at'),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('image')->disk('public')->height(40),
                TextColumn::make('title')->searchable()->limit(40),
                TextColumn::make('placement')->badge()
                    ->formatStateUsing(fn (string $state) => self::PLACEMENTS[$state] ?? $state),
                TextColumn::make('audience')->badge()->toggleable(),
                IconColumn::make('is_active')->boolean()->label('Active'),
                TextColumn::make('priority')->sortable(),
                TextColumn::make('impressions')->numeric()->sortable(),
                TextColumn::make('clicks')->numeric()->sortable(),
                TextColumn::make('ctr')
                    ->label('CTR')
                    ->state(fn (Ad $record) => $record->impressions > 0
                        ? round($record->clicks / $record->impressions * 100, 1).'%'
                        : '—'),
            ])
            ->filters([
                SelectFilter::make('placement')->options(self::PLACEMENTS),
                SelectFilter::make('is_active')->options([1 => 'Active', 0 => 'Inactive']),
            ])
            ->actions([EditAction::make(), DeleteAction::make()])
            ->defaultSort('priority', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ManageAds::route('/'),
        ];
    }
}
