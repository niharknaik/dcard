<?php

namespace App\Http\Requests\Lead;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['nullable', 'email', 'max:191', 'required_without:phone'],
            'phone' => ['nullable', 'string', 'max:20', 'required_without:email'],
            'message' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required_without' => 'Provide at least an email or a phone number.',
            'phone.required_without' => 'Provide at least an email or a phone number.',
        ];
    }
}
