<?php

namespace App\Http\Requests\SocialLink;

use App\Enums\SocialPlatform;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSocialLinkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'platform' => ['sometimes', 'string', Rule::in(SocialPlatform::values())],
            'url' => ['sometimes', 'url', 'max:500'],
            'label' => ['nullable', 'string', 'max:60'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }
}
