@component('mail::message')
# Welcome, {{ $name }}! 👋

Thanks for joining **{{ $appName }}** — your digital visiting card platform.

Here's what you can do next:

- Create your first digital card
- Add your social links and portfolio
- Share your card via a QR code
- Start collecting leads

@component('mail::button', ['url' => config('app.frontend_url')])
Get Started
@endcomponent

Thanks,<br>
The {{ $appName }} Team
@endcomponent
