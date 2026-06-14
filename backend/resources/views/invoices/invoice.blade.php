<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $payment->invoice_number }}</title>
    <style>
        * { font-family: DejaVu Sans, sans-serif; }
        body { color: #1f2937; font-size: 13px; margin: 0; }
        .wrap { padding: 40px; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #4f46e5; padding-bottom: 16px; }
        .brand { font-size: 24px; font-weight: bold; color: #4f46e5; }
        .muted { color: #6b7280; }
        h2 { margin: 24px 0 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { text-align: left; padding: 10px; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; }
        .right { text-align: right; }
        .total { font-size: 16px; font-weight: bold; }
        .footer { margin-top: 40px; color: #9ca3af; font-size: 11px; text-align: center; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; background: #dcfce7; color: #166534; font-size: 11px; }
    </style>
</head>
<body>
<div class="wrap">
    <div class="header">
        <div>
            <div class="brand">{{ $appName }}</div>
            <div class="muted">Digital Visiting Cards</div>
        </div>
        <div class="right">
            <div><strong>INVOICE</strong></div>
            <div class="muted">{{ $payment->invoice_number }}</div>
            <div class="muted">{{ optional($payment->paid_at)->toFormattedDateString() }}</div>
        </div>
    </div>

    <h2>Billed to</h2>
    <div>{{ $payment->user?->name }}</div>
    <div class="muted">{{ $payment->user?->email }}</div>

    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th class="right">Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ $payment->plan?->name }} Plan ({{ $payment->plan?->billing_period }})</td>
                <td class="right">{{ $payment->currency }} {{ number_format((float) $payment->amount, 2) }}</td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <td class="right total">Total</td>
                <td class="right total">{{ $payment->currency }} {{ number_format((float) $payment->amount, 2) }}</td>
            </tr>
        </tfoot>
    </table>

    <p style="margin-top:20px;">
        Status: <span class="badge">{{ ucfirst($payment->status->value ?? (string) $payment->status) }}</span><br>
        Transaction ID: <span class="muted">{{ $payment->transaction_id }}</span><br>
        @if($payment->razorpay_payment_id)
        Razorpay Payment ID: <span class="muted">{{ $payment->razorpay_payment_id }}</span>
        @endif
    </p>

    <div class="footer">
        This is a computer-generated invoice and does not require a signature.<br>
        {{ $appName }} — Thank you for your business.
    </div>
</div>
</body>
</html>
