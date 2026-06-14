<?php

namespace App\Http\Resources\V1;

use App\Enums\PaymentStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $status = $this->status instanceof PaymentStatus ? $this->status->value : $this->status;

        return [
            'id' => $this->id,
            'transaction_id' => $this->transaction_id,
            'invoice_number' => $this->invoice_number,
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'status' => $status,
            'method' => $this->method,
            'plan' => $this->whenLoaded('plan', fn () => [
                'id' => $this->plan?->id,
                'name' => $this->plan?->name,
            ]),
            'razorpay_order_id' => $this->razorpay_order_id,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'has_invoice' => $status === PaymentStatus::Paid->value && $this->invoice_number !== null,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
