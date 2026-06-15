<?php

namespace App\Filament\Resources;

use App\Enums\ContentReportReason;
use App\Enums\ContentReportStatus;
use App\Filament\Resources\ContentReportResource\Pages;
use App\Models\ActivityLog;
use App\Models\ContentReport;
use Filament\Forms\Components\Textarea;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables\Actions\Action;
use Filament\Tables\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class ContentReportResource extends Resource
{
    protected static ?string $model = ContentReport::class;

    protected static ?string $navigationIcon = 'heroicon-o-flag';

    protected static ?string $navigationGroup = 'Content';

    protected static ?string $navigationLabel = 'Content Reports';

    protected static ?int $navigationSort = 3;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function getNavigationBadge(): ?string
    {
        $count = static::getModel()::query()
            ->where('status', ContentReportStatus::Pending->value)
            ->count();

        return $count > 0 ? (string) $count : null;
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('card.full_name')->label('Reported card')->searchable(),
                TextColumn::make('card.slug')->label('Slug')->searchable()->toggleable(),
                TextColumn::make('card.user.name')->label('Owner')->toggleable(),
                TextColumn::make('reason')
                    ->badge()
                    ->formatStateUsing(fn (ContentReportReason $state) => $state->label()),
                TextColumn::make('status')
                    ->badge()
                    ->formatStateUsing(fn (ContentReportStatus $state) => $state->label())
                    ->color(fn (ContentReportStatus $state) => match ($state) {
                        ContentReportStatus::Pending   => 'warning',
                        ContentReportStatus::Reviewing => 'info',
                        ContentReportStatus::Actioned  => 'success',
                        ContentReportStatus::Dismissed => 'gray',
                    }),
                TextColumn::make('reporter_email')->label('Reporter')->placeholder('Anonymous')->toggleable(),
                TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')->options(ContentReportStatus::options()),
                SelectFilter::make('reason')->options(ContentReportReason::options()),
            ])
            ->actions([
                ViewAction::make(),
                Action::make('resolve')
                    ->label('Resolve')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn (ContentReport $record) => $record->status !== ContentReportStatus::Actioned)
                    ->form([
                        Textarea::make('resolution_note')->label('Resolution note')->maxLength(2000),
                    ])
                    ->action(function (ContentReport $record, array $data) {
                        $record->update([
                            'status' => ContentReportStatus::Actioned,
                            'resolution_note' => $data['resolution_note'] ?? null,
                            'resolved_by' => auth()->id(),
                            'resolved_at' => now(),
                        ]);

                        ActivityLog::record(
                            'content_report.resolved',
                            $record,
                            "Resolved report #{$record->id} on card {$record->card?->slug}",
                        );

                        Notification::make()->title('Report marked as actioned.')->success()->send();
                    }),
                Action::make('dismiss')
                    ->label('Dismiss')
                    ->icon('heroicon-o-x-circle')
                    ->color('gray')
                    ->visible(fn (ContentReport $record) => $record->status !== ContentReportStatus::Dismissed)
                    ->requiresConfirmation()
                    ->form([
                        Textarea::make('resolution_note')->label('Reason for dismissal')->maxLength(2000),
                    ])
                    ->action(function (ContentReport $record, array $data) {
                        $record->update([
                            'status' => ContentReportStatus::Dismissed,
                            'resolution_note' => $data['resolution_note'] ?? null,
                            'resolved_by' => auth()->id(),
                            'resolved_at' => now(),
                        ]);

                        ActivityLog::record(
                            'content_report.dismissed',
                            $record,
                            "Dismissed report #{$record->id} on card {$record->card?->slug}",
                        );

                        Notification::make()->title('Report dismissed.')->success()->send();
                    }),
                Action::make('removeContent')
                    ->label('Remove content')
                    ->icon('heroicon-o-no-symbol')
                    ->color('danger')
                    ->visible(fn (ContentReport $record) => (bool) $record->card?->is_published)
                    ->requiresConfirmation()
                    ->modalHeading('Take down reported card')
                    ->modalDescription('This unpublishes the card so it is no longer publicly accessible, and marks the report as actioned.')
                    ->action(function (ContentReport $record) {
                        $card = $record->card;

                        // Card model supports is_published + SoftDeletes. We unpublish
                        // (reversible) rather than hard-delete so the owner/appeals
                        // flow can restore it. To permanently remove, soft-delete the
                        // card from the Cards resource.
                        if ($card !== null) {
                            $card->update(['is_published' => false]);
                        }

                        $record->update([
                            'status' => ContentReportStatus::Actioned,
                            'resolution_note' => 'Card unpublished (taken down) following report.',
                            'resolved_by' => auth()->id(),
                            'resolved_at' => now(),
                        ]);

                        ActivityLog::record(
                            'content_report.content_removed',
                            $record,
                            "Unpublished card {$card?->slug} following report #{$record->id}",
                        );

                        Notification::make()->title('Card unpublished and report actioned.')->success()->send();
                    }),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            TextEntry::make('card.full_name')->label('Reported card'),
            TextEntry::make('card.slug')->label('Slug'),
            TextEntry::make('card.user.name')->label('Card owner')->placeholder('—'),
            TextEntry::make('portfolioItem.title')->label('Reported portfolio item')->placeholder('Whole card'),
            TextEntry::make('reason')->formatStateUsing(fn (ContentReportReason $state) => $state->label()),
            TextEntry::make('status')->badge()->formatStateUsing(fn (ContentReportStatus $state) => $state->label()),
            TextEntry::make('details')->columnSpanFull()->placeholder('—'),
            TextEntry::make('reporter_name')->placeholder('Anonymous'),
            TextEntry::make('reporter_email')->placeholder('—'),
            TextEntry::make('reporter.name')->label('Reporting user')->placeholder('—'),
            TextEntry::make('ip_address')->label('Reporter IP')->placeholder('—'),
            TextEntry::make('resolution_note')->columnSpanFull()->placeholder('—'),
            TextEntry::make('resolver.name')->label('Resolved by')->placeholder('—'),
            TextEntry::make('resolved_at')->dateTime()->placeholder('—'),
            TextEntry::make('created_at')->dateTime(),
        ])->columns(2);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListContentReports::route('/'),
        ];
    }
}
