<?php

namespace App\Http\Requests\Analytics;

use App\Enums\AnalyticsEventType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RecordEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // "view" is recorded server-side on the public card fetch; visitors only
        // report interaction events here.
        $allowed = [
            AnalyticsEventType::QrScan->value,
            AnalyticsEventType::ContactSave->value,
            AnalyticsEventType::LinkClick->value,
            AnalyticsEventType::PortfolioClick->value,
        ];

        return [
            'type' => ['required', 'string', Rule::in($allowed)],
            'metadata' => ['nullable', 'array'],
            'metadata.platform' => ['nullable', 'string', 'max:40'],
            'metadata.item_id' => ['nullable', 'integer'],
        ];
    }
}
