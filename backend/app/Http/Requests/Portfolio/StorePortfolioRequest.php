<?php

namespace App\Http\Requests\Portfolio;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePortfolioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $type = $this->input('type');

        return [
            'title' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:2000'],
            'type' => ['required', 'string', Rule::in(['image', 'video', 'pdf', 'brochure', 'catalog'])],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            // Validate by REAL mime type (not just extension) per declared type.
            'media' => array_merge(['required', 'file'], $this->mediaConstraints($type)),
        ];
    }

    private function mediaConstraints(?string $type): array
    {
        return match ($type) {
            'image' => ['mimetypes:image/jpeg,image/png,image/webp,image/gif', 'max:5120'],   // 5 MB
            'video' => ['mimetypes:video/mp4,video/quicktime,video/webm', 'max:51200'],        // 50 MB
            'pdf', 'brochure', 'catalog' => ['mimetypes:application/pdf', 'max:10240'],         // 10 MB
            default => ['max:10240'],
        };
    }
}
