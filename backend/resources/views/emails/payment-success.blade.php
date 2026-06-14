@component('mail::message')
# Payment received ✅

Thank you! We've received your payment.

**Invoice:** {{ $payment->invoice_number }}
**Plan:** {{ $planName }}
**Amount:** {{ $payment->currency }} {{ number_format((float) $payment->amount, 2) }}
**Date:** {{ optional($payment->paid_at)->toFormattedDateString() }}
**Transaction ID:** {{ $payment->transaction_id }}

@component('mail::button', ['url' => config('app.frontend_url').'/payments'])
View Payment History
@endcomponent

Thanks,<br>
The {{ config('app.name') }} Team
@endcomponent
