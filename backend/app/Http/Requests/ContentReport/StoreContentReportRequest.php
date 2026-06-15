<?php

namespace App\Http\Requests\ContentReport;

use App\Enums\ContentReportReason;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContentReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', Rule::in(ContentReportReason::values())],
            'details' => ['nullable', 'string', 'max:2000'],
            'reporter_name' => ['nullable', 'string', 'max:120'],
            'reporter_email' => ['nullable', 'email', 'max:191'],
            'portfolio_item_id' => ['nullable', 'integer'],
        ];
    }

    public function messages(): array
    {
        return [
            'reason.in' => 'Select a valid report reason.',
        ];
    }
}
