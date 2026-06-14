<?php

namespace App\Http\Resources\V1;

use App\Enums\NotificationType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $type = $this->type instanceof NotificationType ? $this->type : NotificationType::tryFrom((string) $this->type);

        return [
            'id' => $this->id,
            'type' => $type?->value,
            'type_label' => $type?->label(),
            'title' => $this->title,
            'message' => $this->message,
            'data' => $this->data,
            'is_read' => (bool) $this->is_read,
            'read_at' => $this->read_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
