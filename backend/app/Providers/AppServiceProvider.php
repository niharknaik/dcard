<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    /**
     * Named rate limiters referenced by routes (throttle:api / auth / public).
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute((int) env('API_RATE_LIMIT', 60))
                ->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth', function (Request $request) {
            // Throttle login/register/forgot by email + IP to slow credential stuffing.
            return Limit::perMinute((int) env('AUTH_RATE_LIMIT', 10))
                ->by(($request->input('email') ?? '').'|'.$request->ip());
        });

        RateLimiter::for('public', function (Request $request) {
            return Limit::perMinute((int) env('PUBLIC_RATE_LIMIT', 120))->by($request->ip());
        });
    }
}
