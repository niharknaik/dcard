<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => [
                'sometimes', 'email:rfc', 'max:191',
                Rule::unique('users', 'email')->ignore($this->user()->id),
            ],
            'avatar' => ['sometimes', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }
}
