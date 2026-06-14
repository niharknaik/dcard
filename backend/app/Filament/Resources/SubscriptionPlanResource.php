<?php

namespace App\Filament\Resources;

use App\Filament\Concerns\SuperAdminOnly;
use App\Filament\Resources\SubscriptionPlanResource\Pages;
use App\Models\SubscriptionPlan;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
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
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class SubscriptionPlanResource extends Resource
{
    use SuperAdminOnly;

    protected static ?string $model = SubscriptionPlan::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    protected static ?string $navigationGroup = 'Billing';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Section::make('Plan')->schema([
                TextInput::make('name')->required()->maxLength(120)
                    ->live(onBlur: true)
                    ->afterStateUpdated(fn (Set $set, ?string $state) => $set('slug', Str::slug((string) $state))),
                TextInput::make('slug')->required()->unique(ignoreRecord: true),
                TextInput::make('code')->required()->unique(ignoreRecord: true)
                    ->helperText('Machine code: free, premium, business'),
                Textarea::make('description')->rows(2)->columnSpanFull(),
            ])->columns(3),

            Section::make('Pricing')->schema([
                TextInput::make('price')->numeric()->default(0)->required()->prefix('₹'),
                TextInput::make('currency')->default('INR')->maxLength(3),
                Select::make('billing_period')->options([
                    'monthly' => 'Monthly',
                    'yearly' => 'Yearly',
                    'lifetime' => 'Lifetime',
                ])->default('monthly')->required(),
            ])->columns(3),

            Section::make('Limits & features')->schema([
                TextInput::make('card_limit')->numeric()->default(1)
                    ->helperText('0 = unlimited'),
                Toggle::make('allow_portfolio'),
                Toggle::make('allow_leads'),
                Toggle::make('allow_team'),
                TagsInput::make('features')->columnSpanFull()
                    ->helperText('Press Enter after each feature'),
            ])->columns(4),

            Section::make('Visibility')->schema([
                Toggle::make('is_active')->default(true),
                TextInput::make('sort_order')->numeric()->default(0),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->searchable()->sortable(),
                TextColumn::make('code')->badge(),
                TextColumn::make('price')->money('INR')->sortable(),
                TextColumn::make('billing_period')->badge(),
                TextColumn::make('card_limit')->formatStateUsing(fn ($state) => $state == 0 ? 'Unlimited' : $state),
                IconColumn::make('is_active')->boolean(),
                TextColumn::make('subscriptions_count')->counts('subscriptions')->label('Subscribers'),
            ])
            ->actions([EditAction::make()])
            ->bulkActions([BulkActionGroup::make([DeleteBulkAction::make()])])
            ->defaultSort('sort_order');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSubscriptionPlans::route('/'),
            'create' => Pages\CreateSubscriptionPlan::route('/create'),
            'edit' => Pages\EditSubscriptionPlan::route('/{record}/edit'),
        ];
    }
}
