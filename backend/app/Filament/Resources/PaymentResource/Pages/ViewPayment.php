<?php

namespace App\Filament\Resources\PaymentResource\Pages;

use App\Filament\Resources\PaymentResource;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;
use Filament\Resources\Pages\ViewRecord;

class ViewPayment extends ViewRecord
{
    protected static string $resource = PaymentResource::class;

    public function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            TextEntry::make('invoice_number'),
            TextEntry::make('user.name')->label('User'),
            TextEntry::make('user.email')->label('Email'),
            TextEntry::make('plan.name')->label('Plan'),
            TextEntry::make('amount')->money('INR'),
            TextEntry::make('status')->badge(),
            TextEntry::make('method')->placeholder('—'),
            TextEntry::make('transaction_id'),
            TextEntry::make('razorpay_order_id')->placeholder('—'),
            TextEntry::make('razorpay_payment_id')->placeholder('—'),
            TextEntry::make('paid_at')->dateTime()->placeholder('—'),
            TextEntry::make('created_at')->dateTime(),
        ])->columns(2);
    }
}
