@component('mail::message')
# Your subscription is expiring soon

Hi {{ $name }},
@if($endsAt)

Your subscription expires on **{{ $endsAt }}**. Renew now to avoid losing access to
premium features like unlimited cards, portfolio uploads, and lead collection.
@else

Your subscription is expiring soon. Renew now to keep your premium features.
@endif

@component('mail::button', ['url' => config('app.frontend_url').'/subscription'])
Renew Subscription
@endcomponent

Thanks,<br>
The {{ config('app.name') }} Team
@endcomponent
