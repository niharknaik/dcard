<?php

namespace App\Http\Requests\Template;

use Illuminate\Foundation\Http\FormRequest;

class VerifyPlayTemplatePurchaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'purchase_token' => ['required', 'string'],
            'product_id'     => ['required', 'string'],
            'template_id'    => ['required', 'integer'],
            'method'         => ['sometimes', 'string'],
        ];
    }
}
