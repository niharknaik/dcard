<?php

namespace App\Filament\Pages;

use App\Models\ActivityLog;
use App\Models\Setting;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

class ManageSettings extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static ?string $navigationGroup = 'System';

    protected static ?int $navigationSort = 2;

    protected static ?string $title = 'App Settings';

    protected static string $view = 'filament.pages.manage-settings';

    /** @var array<string, mixed> */
    public ?array $data = [];

    /** Super administrators only. */
    public static function canAccess(): bool
    {
        return (bool) auth()->user()?->isSuperAdmin();
    }

    public function mount(): void
    {
        $this->form->fill([
            'app_name' => Setting::get('app_name'),
            'maintenance_mode' => Setting::get('maintenance_mode', false),
            'signups_enabled' => Setting::get('signups_enabled', true),
            'announcement_banner' => Setting::get('announcement_banner'),
            'support_email' => Setting::get('support_email'),
            'support_url' => Setting::get('support_url'),
            'ads_enabled' => Setting::get('ads_enabled', true),
            'admob_enabled' => Setting::get('admob_enabled', false),
            'admob_android_banner_id' => Setting::get('admob_android_banner_id'),
            'admob_ios_banner_id' => Setting::get('admob_ios_banner_id'),
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('General')
                    ->description('Core app behaviour shown to mobile clients.')
                    ->schema([
                        TextInput::make('app_name')->required()->maxLength(60),
                        Toggle::make('signups_enabled')
                            ->label('Allow new sign-ups')
                            ->helperText('When off, registration is rejected.'),
                        Toggle::make('maintenance_mode')
                            ->label('Maintenance mode')
                            ->helperText('When on, the API returns 503 (login still allowed).'),
                        Textarea::make('announcement_banner')
                            ->rows(2)
                            ->helperText('Optional banner text surfaced to the app. Leave blank to hide.')
                            ->columnSpanFull(),
                    ])->columns(2),

                Section::make('Support')
                    ->schema([
                        TextInput::make('support_email')->email(),
                        TextInput::make('support_url')->url(),
                    ])->columns(2),

                Section::make('Ads')
                    ->description('Only free users ever see ads. House ads are managed under Ads; AdMob is the fallback fill.')
                    ->schema([
                        Toggle::make('ads_enabled')->label('Ads enabled (master switch)'),
                        Toggle::make('admob_enabled')->label('AdMob fallback enabled'),
                        TextInput::make('admob_android_banner_id')->label('AdMob Android banner unit ID'),
                        TextInput::make('admob_ios_banner_id')->label('AdMob iOS banner unit ID'),
                    ])->columns(2),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        $data = $this->form->getState();

        Setting::set('app_name', $data['app_name'], 'string', 'general');
        Setting::set('maintenance_mode', (bool) $data['maintenance_mode'], 'bool', 'general');
        Setting::set('signups_enabled', (bool) $data['signups_enabled'], 'bool', 'general');
        Setting::set('announcement_banner', $data['announcement_banner'] ?: null, 'string', 'general');
        Setting::set('support_email', $data['support_email'], 'string', 'support');
        Setting::set('support_url', $data['support_url'], 'string', 'support');
        Setting::set('ads_enabled', (bool) $data['ads_enabled'], 'bool', 'ads');
        Setting::set('admob_enabled', (bool) $data['admob_enabled'], 'bool', 'ads');
        Setting::set('admob_android_banner_id', $data['admob_android_banner_id'] ?: null, 'string', 'ads');
        Setting::set('admob_ios_banner_id', $data['admob_ios_banner_id'] ?: null, 'string', 'ads');

        ActivityLog::record('settings.updated', null, 'Updated app settings');

        Notification::make()->title('Settings saved')->success()->send();
    }
}
