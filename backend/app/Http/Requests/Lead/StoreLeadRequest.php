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
            // Honeypot: must stay empty. Bots that auto-fill every field trip it.
            // Kept as a lax validation rule so a tripped honeypot never surfaces
            // a 422 (which would teach the bot); the controller handles rejection.
            'website' => ['nullable', 'string', 'max:255'],
            // Consent (COMPLIANCE §5): the visitor must opt in before we share
            // their details with the card owner.
            'consent' => ['required', 'accepted'],
        ];
    }

    /**
     * Whether the honeypot field was filled — signalling an automated submission.
     */
    public function isBot(): bool
    {
        return filled($this->input('website'));
    }

    public function messages(): array
    {
        return [
            'email.required_without' => 'Provide at least an email or a phone number.',
            'phone.required_without' => 'Provide at least an email or a phone number.',
            'consent.required' => 'Please confirm you agree to share your details.',
            'consent.accepted' => 'Please confirm you agree to share your details.',
        ];
    }
}
