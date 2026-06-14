<?php

namespace App\Http\Requests\Template;

use App\Enums\TemplateUnlockMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UnlockTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'method' => ['required', 'string', Rule::in(TemplateUnlockMethod::values())],
        ];
    }
}
