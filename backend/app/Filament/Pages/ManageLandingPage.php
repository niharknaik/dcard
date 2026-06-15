<?php

namespace App\Filament\Pages;

use App\Models\ActivityLog;
use App\Support\LandingContent;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

/**
 * Edit the web landing page marketing content (hero, stats, features, steps,
 * testimonials, trusted-by, pricing, FAQ, CTA). Saved to settings and served to
 * the web app via GET /api/v1/content/landing. Changes take effect immediately.
 */
class ManageLandingPage extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-window';

    protected static ?string $navigationGroup = 'CMS';

    protected static ?int $navigationSort = 1;

    protected static ?string $title = 'Landing Page';

    protected static ?string $navigationLabel = 'Landing Page';

    protected static string $view = 'filament.pages.manage-landing-page';

    public ?array $data = [];

    private const ICONS = [
        'card' => 'Card',
        'qr' => 'QR code',
        'inbox' => 'Inbox / Leads',
        'chart' => 'Chart / Analytics',
        'portfolio' => 'Portfolio',
        'bell' => 'Bell / Notifications',
        'globe' => 'Globe',
        'bolt' => 'Bolt',
        'star' => 'Star',
        'shield' => 'Shield',
        'users' => 'Users',
        'sparkle' => 'Sparkle',
    ];

    public function mount(): void
    {
        $this->form->fill(LandingContent::current());
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('Hero')
                    ->description('The top section of the landing page.')
                    ->schema([
                        TextInput::make('hero.badge')->label('Badge text')->columnSpanFull(),
                        TextInput::make('hero.title')->label('Headline')->required(),
                        TextInput::make('hero.highlight')->label('Highlighted word')
                            ->helperText('Rendered in the brand gradient at the end of the headline.'),
                        Textarea::make('hero.description')->rows(2)->columnSpanFull(),
                        TextInput::make('hero.primary_cta')->label('Primary button'),
                        TextInput::make('hero.secondary_cta')->label('Secondary button'),
                        TextInput::make('hero.rating')->label('Rating'),
                        TextInput::make('hero.rating_caption')->label('Rating caption'),
                    ])->columns(2),

                Section::make('Stats bar')->schema([
                    Repeater::make('stats')->schema([
                        TextInput::make('value')->required(),
                        TextInput::make('label')->required(),
                    ])->columns(2)->defaultItems(0)->reorderable()->collapsible()->itemLabel(fn (array $state) => $state['label'] ?? null),
                ]),

                Section::make('Features')->schema([
                    Repeater::make('features')->schema([
                        Select::make('icon')->options(self::ICONS)->required(),
                        TextInput::make('title')->required(),
                        Textarea::make('description')->rows(2)->columnSpanFull(),
                    ])->columns(2)->defaultItems(0)->reorderable()->collapsible()->itemLabel(fn (array $state) => $state['title'] ?? null),
                ]),

                Section::make('How it works')->schema([
                    Repeater::make('steps')->schema([
                        TextInput::make('title')->required(),
                        Textarea::make('description')->rows(2),
                    ])->columns(2)->defaultItems(0)->reorderable()->collapsible()->itemLabel(fn (array $state) => $state['title'] ?? null),
                ]),

                Section::make('Testimonials')->schema([
                    Repeater::make('testimonials')->schema([
                        Textarea::make('quote')->rows(2)->required()->columnSpanFull(),
                        TextInput::make('name')->required(),
                        TextInput::make('role'),
                        TextInput::make('initials')->maxLength(3),
                    ])->columns(3)->defaultItems(0)->reorderable()->collapsible()->itemLabel(fn (array $state) => $state['name'] ?? null),
                ]),

                Section::make('Trusted by')->schema([
                    TagsInput::make('trusted_by')->label('Company names')
                        ->helperText('Press Enter after each name.'),
                ]),

                Section::make('Pricing plans')
                    ->description('Marketing pricing cards shown on the landing page.')
                    ->schema([
                        Repeater::make('pricing')->schema([
                            TextInput::make('name')->required(),
                            TextInput::make('price')->required(),
                            TextInput::make('period'),
                            Toggle::make('highlight')->label('Most popular'),
                            Textarea::make('description')->rows(2)->columnSpanFull(),
                            TagsInput::make('features')->columnSpanFull(),
                            TextInput::make('cta')->label('Button label'),
                        ])->columns(3)->defaultItems(0)->reorderable()->collapsible()->itemLabel(fn (array $state) => $state['name'] ?? null),
                    ]),

                Section::make('FAQ')->schema([
                    Repeater::make('faqs')->schema([
                        TextInput::make('q')->label('Question')->required()->columnSpanFull(),
                        Textarea::make('a')->label('Answer')->rows(2)->columnSpanFull(),
                    ])->defaultItems(0)->reorderable()->collapsible()->itemLabel(fn (array $state) => $state['q'] ?? null),
                ]),

                Section::make('Closing CTA')->schema([
                    TextInput::make('cta.badge')->label('Badge'),
                    TextInput::make('cta.title')->label('Heading'),
                    Textarea::make('cta.description')->rows(2)->columnSpanFull(),
                ])->columns(2),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        LandingContent::save($this->form->getState());

        ActivityLog::record('landing.updated', null, 'Updated landing page content');

        Notification::make()->title('Landing page saved')->success()->send();
    }
}
