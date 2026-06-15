<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'subscription_id', 'subscription_plan_id', 'gateway',
        'transaction_id', 'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature',
        'amount', 'currency', 'status', 'method', 'invoice_number',
        'meta', 'paid_at', 'refunded_at',
    ];

    protected function casts(): array
    {
        return [
            'status'      => PaymentStatus::class,
            'amount'      => 'decimal:2',
            'meta'        => 'array',
            'paid_at'     => 'datetime',
            'refunded_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    public function scopePaid($query)
    {
        return $query->where('status', PaymentStatus::Paid->value);
    }
}
