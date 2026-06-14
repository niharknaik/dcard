<?php

namespace App\Filament\Pages;

use App\Enums\NotificationType;
use App\Mail\AnnouncementMail;
use App\Models\ActivityLog;
use App\Models\Notification as UserNotification;
use App\Models\User;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Mail;

class BroadcastAnnouncement extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-megaphone';

    protected static ?string $navigationGroup = 'System';

    protected static ?int $navigationSort = 3;

    protected static ?string $title = 'Broadcast Announcement';

    protected static string $view = 'filament.pages.broadcast-announcement';

    /** @var array<string, mixed> */
    public ?array $data = [];

    public static function canAccess(): bool
    {
        return (bool) auth()->user()?->isSuperAdmin();
    }

    public function mount(): void
    {
        $this->form->fill(['audience' => 'all', 'channels' => ['in_app']]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Select::make('audience')
                    ->options([
                        'all' => 'All users',
                        'premium' => 'Premium subscribers',
                        'business' => 'Business subscribers',
                        'admins' => 'Administrators',
                    ])
                    ->required()
                    ->native(false),
                TextInput::make('title')->required()->maxLength(120),
                Textarea::make('message')->required()->rows(4),
                CheckboxList::make('channels')
                    ->options(['in_app' => 'In-app notification', 'email' => 'Email'])
                    ->required()
                    ->helperText('Email requires the queue worker to be running.')
                    ->columns(2),
            ])
            ->statePath('data');
    }

    public function send(): void
    {
        $data = $this->form->getState();
        $channels = $data['channels'] ?? [];

        $query = $this->audienceQuery($data['audience']);
        $total = (clone $query)->count();

        if ($total === 0) {
            Notification::make()->title('No recipients matched that audience')->warning()->send();

            return;
        }

        $query->chunkById(500, function ($users) use ($data, $channels) {
            foreach ($users as $user) {
                if (in_array('in_app', $channels, true)) {
                    UserNotification::create([
                        'user_id' => $user->id,
                        'type' => NotificationType::Announcement,
                        'title' => $data['title'],
                        'message' => $data['message'],
                        'data' => ['broadcast' => true],
                    ]);
                }

                if (in_array('email', $channels, true) && $user->email) {
                    Mail::to($user->email)->queue(new AnnouncementMail($data['title'], $data['message'], $user->name));
                }
            }
        });

        ActivityLog::record(
            'announcement.sent',
            null,
            "Sent '{$data['title']}' to {$total} {$data['audience']} user(s)",
            ['audience' => $data['audience'], 'channels' => $channels, 'recipients' => $total],
        );

        Notification::make()->title("Announcement queued to {$total} user(s)")->success()->send();

        $this->form->fill(['audience' => 'all', 'channels' => ['in_app']]);
    }

    private function audienceQuery(string $audience): Builder
    {
        return match ($audience) {
            'admins' => User::query()->where('is_admin', true),
            'premium', 'business' => User::query()->whereHas('subscriptions', fn (Builder $q) => $q
                ->where('status', 'active')
                ->whereHas('plan', fn (Builder $p) => $p->where('code', $audience))),
            default => User::query(),
        };
    }
}
