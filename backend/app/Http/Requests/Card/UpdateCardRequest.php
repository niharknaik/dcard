<?php

namespace App\Http\Requests\Card;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $cardId = $this->route('card')?->id;

        return [
            'full_name' => ['sometimes', 'string', 'max:120'],
            'slug' => ['sometimes', 'string', 'max:160', 'alpha_dash', Rule::unique('cards', 'slug')->ignore($cardId)],
            'designation' => ['nullable', 'string', 'max:120'],
            'company' => ['nullable', 'string', 'max:160'],
            'phone' => ['nullable', 'string', 'max:20'],
            'whatsapp' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:191'],
            'website' => ['nullable', 'url', 'max:191'],
            'address' => ['nullable', 'string', 'max:255'],
            'about' => ['nullable', 'string', 'max:2000'],
            'card_template_id' => ['nullable', 'integer', 'exists:card_templates,id'],
            'profile_photo' => ['sometimes', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'theme' => ['nullable', 'array'],
            'is_published' => ['boolean'],
        ];
    }
}
