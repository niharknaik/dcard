<?php

namespace App\Http\Resources\V1;

use App\Enums\TemplatePurchaseStatus;
use App\Enums\TemplateUnlockMethod;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TemplatePurchaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $status = $this->status instanceof TemplatePurchaseStatus ? $this->status->value : $this->status;
        $method = $this->unlock_method instanceof TemplateUnlockMethod ? $this->unlock_method->value : $this->unlock_method;

        return [
            'id'                => $this->id,
            'template_id'       => $this->template_id,
            'template'          => new TemplateResource($this->whenLoaded('template')),
            'unlock_method'     => $method,
            'amount'            => (float) $this->amount,
            'currency'          => $this->currency,
            'points_spent'      => (int) $this->points_spent,
            'status'            => $status,
            'razorpay_order_id' => $this->razorpay_order_id,
            'paid_at'           => $this->paid_at?->toIso8601String(),
            'created_at'        => $this->created_at?->toIso8601String(),
        ];
    }
}
