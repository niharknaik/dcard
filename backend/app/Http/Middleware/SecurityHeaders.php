<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Adds hardening response headers to every response and strips
 * server-identifying headers where the runtime allows it.
 */
class SecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): \Symfony\Component\HttpFoundation\Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $headers = [
            'X-Content-Type-Options'             => 'nosniff',
            'X-Frame-Options'                    => 'DENY',
            'Referrer-Policy'                    => 'strict-origin-when-cross-origin',
            'X-Permitted-Cross-Domain-Policies'  => 'none',
            'Permissions-Policy'                 => 'geolocation=(), microphone=(), camera=()',
            'Content-Security-Policy'            => $this->contentSecurityPolicy($request),
        ];

        foreach ($headers as $name => $value) {
            $response->headers->set($name, $value);
        }

        // HSTS only over HTTPS or in production to avoid breaking local http dev.
        if ($request->isSecure() || app()->environment('production')) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains'
            );
        }

        // Remove server-identifying headers where possible.
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');
        if (! headers_sent()) {
            header_remove('X-Powered-By');
            header_remove('Server');
        }

        return $response;
    }

    /**
     * Build the Content-Security-Policy for the current request.
     *
     * The backend serves two very different surfaces:
     *   - a JSON API, which needs no scripts/styles/images of its own and so
     *     can use a locked-down policy;
     *   - the Filament admin panel, which relies on Alpine/Livewire and ships
     *     inline scripts and styles, so it needs 'unsafe-inline' (and inline
     *     style attributes) to function.
     *
     * We branch on the request path: Filament is mounted under /admin
     * (see config/filament.php 'path'). Everything else gets the strict API
     * policy.
     *
     * Overridable: set CSP_ENABLED=false in the environment to disable the
     * header entirely (e.g. while debugging a CSP violation in staging).
     */
    protected function contentSecurityPolicy(Request $request): ?string
    {
        if (filter_var(env('CSP_ENABLED', true), FILTER_VALIDATE_BOOLEAN) === false) {
            return null;
        }

        // Filament admin: permissive enough for Alpine/Livewire inline assets.
        // NOTE: 'unsafe-inline' for script-src is required by Filament/Livewire
        // today. To tighten further you would need to adopt nonce/hash-based
        // CSP, which Filament does not yet support out of the box.
        if ($request->is('admin', 'admin/*')) {
            return implode('; ', [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data:",
                "font-src 'self' data:",
                "connect-src 'self'",
                "frame-ancestors 'none'",
                "base-uri 'self'",
                "form-action 'self'",
            ]);
        }

        // JSON API surface: it renders nothing, so lock everything down.
        return "default-src 'none'; frame-ancestors 'none'; base-uri 'none'";
    }
}
