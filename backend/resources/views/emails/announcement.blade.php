@component('mail::message')
# {{ $title }}

Hi {{ $name }},

{{ $body }}

Thanks,<br>
The {{ $appName }} Team
@endcomponent
