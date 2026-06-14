<?php

namespace App\Filament\Resources;

use App\Enums\NotificationType;
use App\Enums\PaymentStatus;
use App\Filament\Resources\PaymentResource\Pages;
use App\Models\ActivityLog;
use App\Models\Payment;
use App\Services\NotificationService;
use App\Services\RazorpayService;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables\Actions\Action;
use Filament\Tables\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class PaymentResource extends Resource
{
    protected static ?string $model = Payment::class;

    protected static ?string $navigationIcon = 'heroicon-o-credit-card';

    protected static ?string $navigationGroup = 'Billing';

    protected static ?int $navigationSort = 3;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('invoice_number')->searchable()->placeholder('—'),
                TextColumn::make('user.name')->label('User')->searchable(),
                TextColumn::make('plan.name')->label('Plan')->badge(),
                TextColumn::make('amount')->money('INR')->sortable(),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn ($state) => match ((string) ($state->value ?? $state)) {
                        'paid' => 'success',
                        'failed' => 'danger',
                        'refunded' => 'warning',
                        default => 'gray',
                    }),
                TextColumn::make('transaction_id')->searchable()->toggleable(),
                TextColumn::make('paid_at')->dateTime()->sortable()->placeholder('—'),
                TextColumn::make('created_at')->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')->options([
                    'created' => 'Created',
                    'paid' => 'Paid',
                    'failed' => 'Failed',
                    'refunded' => 'Refunded',
                ]),
            ])
            ->actions([
                ViewAction::make(),
                Action::make('invoice')
                    ->label('Invoice')
                    ->icon('heroicon-o-document-arrow-down')
                    ->visible(fn (Payment $record) => $record->invoice_number !== null)
                    ->action(fn (Payment $record) => app(\App\Services\InvoiceService::class)
                        ->pdf($record)
                        ->download("invoice-{$record->invoice_number}.pdf")),
                Action::make('refund')
                    ->label('Refund')
                    ->icon('heroicon-o-receipt-refund')
                    ->color('warning')
                    ->visible(fn (Payment $record) => static::canRefund($record))
                    ->requiresConfirmation()
                    ->modalHeading('Refund payment')
                    ->modalDescription(fn (Payment $record) => 'Refund ₹'.number_format((float) $record->amount, 2).' to '.$record->user?->name.'? This calls Razorpay and cannot be undone.')
                    ->form([
                        Textarea::make('reason')->label('Reason (internal)')->rows(2),
                    ])
                    ->action(function (Payment $record, array $data) {
                        try {
                            app(RazorpayService::class)->refund((string) $record->razorpay_payment_id, (float) $record->amount);
                        } catch (\Throwable $e) {
                            Notification::make()->title('Refund failed')->body($e->getMessage())->danger()->send();

                            return;
                        }

                        $record->update(['status' => PaymentStatus::Refunded, 'refunded_at' => now()]);

                        if ($record->user) {
                            app(NotificationService::class)->send(
                                $record->user,
                                NotificationType::PaymentRefunded,
                                'Payment refunded',
                                'Your payment of ₹'.number_format((float) $record->amount, 2).' has been refunded.',
                                ['payment_id' => $record->id],
                            );
                        }

                        ActivityLog::record(
                            'payment.refunded',
                            $record,
                            'Refunded ₹'.number_format((float) $record->amount, 2).' to '.$record->user?->email,
                            ['reason' => $data['reason'] ?? null],
                        );

                        Notification::make()->title('Payment refunded')->success()->send();
                    }),
            ])
            ->defaultSort('created_at', 'desc');
    }

    /** Only paid Razorpay payments are refundable, by a super admin or payments.refund holder. */
    protected static function canRefund(Payment $record): bool
    {
        $user = auth()->user();

        return $record->status === PaymentStatus::Paid
            && ! empty($record->razorpay_payment_id)
            && $user
            && ($user->isSuperAdmin() || $user->hasPermission('payments.refund'));
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPayments::route('/'),
            'view' => Pages\ViewPayment::route('/{record}'),
        ];
    }
}
