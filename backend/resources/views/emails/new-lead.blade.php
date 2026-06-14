@component('mail::message')
# You have a new lead! 🎉

Someone reached out via your card **{{ $cardName }}**.

**Name:** {{ $lead->name }}
@if($lead->email)
**Email:** {{ $lead->email }}
@endif
@if($lead->phone)
**Phone:** {{ $lead->phone }}
@endif
@if($lead->message)

> {{ $lead->message }}
@endif

@component('mail::button', ['url' => config('app.frontend_url').'/leads'])
View Lead
@endcomponent

Thanks,<br>
The {{ config('app.name') }} Team
@endcomponent
