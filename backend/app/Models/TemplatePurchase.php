<?php

namespace App\Models;

use App\Enums\TemplatePurchaseStatus;
use App\Enums\TemplateUnlockMethod;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TemplatePurchase extends Model
{
    protected $fillable = [
        'user_id', 'template_id', 'unlock_method', 'amount', 'currency',
        'points_spent', 'status', 'transaction_id',
        'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature', 'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'unlock_method' => TemplateUnlockMethod::class,
            'status'        => TemplatePurchaseStatus::class,
            'amount'        => 'decimal:2',
            'points_spent'  => 'integer',
            'paid_at'       => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', TemplatePurchaseStatus::Completed->value);
    }
}
