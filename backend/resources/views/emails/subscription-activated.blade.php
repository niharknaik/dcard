@component('mail::message')
# You're all set, {{ $name }}! 🚀

Your **{{ $planName }}** plan is now active.
@if($endsAt)

**Valid until:** {{ $endsAt }}
@endif

@component('mail::button', ['url' => config('app.frontend_url')])
Open {{ config('app.name') }}
@endcomponent

Thanks for upgrading,<br>
The {{ config('app.name') }} Team
@endcomponent
