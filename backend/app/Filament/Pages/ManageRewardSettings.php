<?php

namespace App\Filament\Pages;

use App\Models\ActivityLog;
use App\Models\RewardSetting;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

/**
 * Admin-editable reward rules. Changing these values takes effect immediately —
 * no code changes or deploys required.
 */
class ManageRewardSettings extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-gift';

    protected static ?string $navigationGroup = 'Rewards';

    protected static ?int $navigationSort = 4;

    protected static ?string $title = 'Reward Settings';

    protected static ?string $navigationLabel = 'Reward Settings';

    protected static string $view = 'filament.pages.manage-reward-settings';

    public ?array $data = [];

    public static function canAccess(): bool
    {
        return (bool) auth()->user()?->isSuperAdmin();
    }

    public function mount(): void
    {
        $this->form->fill([
            'rewards_enabled'           => RewardSetting::get('rewards_enabled', true),
            'referral_reward_points'    => RewardSetting::points('referral_reward_points', 50),
            'signup_bonus_points'       => RewardSetting::points('signup_bonus_points', 0),
            'promotional_reward_points' => RewardSetting::points('promotional_reward_points', 0),
            'min_redeem_points'         => RewardSetting::points('min_redeem_points', 100),
            'points_to_inr_rate'        => RewardSetting::points('points_to_inr_rate', 1),
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('General')
                    ->schema([
                        Toggle::make('rewards_enabled')
                            ->label('Rewards system enabled'),
                    ]),

                Section::make('Earning rules')
                    ->description('Points awarded for each activity. Changes apply to future activity immediately.')
                    ->schema([
                        TextInput::make('referral_reward_points')->numeric()->minValue(0)->required()
                            ->suffix('pts')->helperText('Awarded to the referrer when an invited user signs up.'),
                        TextInput::make('signup_bonus_points')->numeric()->minValue(0)->required()
                            ->suffix('pts')->helperText('Awarded to every new user on signup.'),
                        TextInput::make('promotional_reward_points')->numeric()->minValue(0)->required()
                            ->suffix('pts')->helperText('Default amount for promotional campaigns.'),
                    ])->columns(3),

                Section::make('Redemption rules')
                    ->schema([
                        TextInput::make('min_redeem_points')->numeric()->minValue(0)->required()
                            ->suffix('pts')->helperText('Minimum points a user must redeem at once.'),
                        TextInput::make('points_to_inr_rate')->numeric()->minValue(1)->required()
                            ->suffix('pts = ₹1')->helperText('Conversion used for "money + points" template unlocks.'),
                    ])->columns(2),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        $data = $this->form->getState();

        RewardSetting::set('rewards_enabled', (bool) $data['rewards_enabled'], 'bool', 'general', 'Rewards System Enabled');
        RewardSetting::set('referral_reward_points', (int) $data['referral_reward_points'], 'int', 'referral', 'Referral Reward Points');
        RewardSetting::set('signup_bonus_points', (int) $data['signup_bonus_points'], 'int', 'signup', 'Signup Bonus Points');
        RewardSetting::set('promotional_reward_points', (int) $data['promotional_reward_points'], 'int', 'promotional', 'Promotional Reward Points');
        RewardSetting::set('min_redeem_points', (int) $data['min_redeem_points'], 'int', 'redemption', 'Minimum Points To Redeem');
        RewardSetting::set('points_to_inr_rate', (int) $data['points_to_inr_rate'], 'int', 'redemption', 'Points per ₹1');

        ActivityLog::record('reward_settings.updated', null, 'Updated reward settings');

        Notification::make()->title('Reward settings saved')->success()->send();
    }
}
