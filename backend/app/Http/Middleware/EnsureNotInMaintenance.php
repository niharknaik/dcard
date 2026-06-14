<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Blocks the API with a 503 when maintenance mode is enabled, while still
 * allowing authentication routes so staff can log in.
 */
class EnsureNotInMaintenance
{
    public function handle(Request $request, Closure $next): Response
    {
        if (Setting::get('maintenance_mode', false) && ! $request->is('api/v1/auth/*')) {
            abort(503, 'DCard is under maintenance. Please try again shortly.');
        }

        return $next($request);
    }
}
