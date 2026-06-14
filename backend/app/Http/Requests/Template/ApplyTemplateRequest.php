<?php

namespace App\Http\Requests\Template;

use Illuminate\Foundation\Http\FormRequest;

class ApplyTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'card_id' => ['required', 'integer', 'exists:cards,id'],
            'color' => ['nullable', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ];
    }
}
