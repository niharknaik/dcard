<?php

/*
 * Configuration for php-open-source-saver/jwt-auth.
 * Run `php artisan jwt:secret` to populate JWT_SECRET.
 */

return [
    'secret' => env('JWT_SECRET'),

    'keys' => [
        'public' => env('JWT_PUBLIC_KEY'),
        'private' => env('JWT_PRIVATE_KEY'),
        'passphrase' => env('JWT_PASSPHRASE'),
    ],

    'ttl' => (int) env('JWT_TTL', 60),                 // access token, minutes
    'refresh_ttl' => (int) env('JWT_REFRESH_TTL', 20160), // refresh window, minutes (14d)

    'algo' => env('JWT_ALGO', 'HS256'),

    'required_claims' => ['iss', 'iat', 'exp', 'nbf', 'sub', 'jti'],
    'persistent_claims' => [],
    'lock_subject' => true,

    'leeway' => (int) env('JWT_LEEWAY', 0),
    'blacklist_enabled' => (bool) env('JWT_BLACKLIST_ENABLED', true),
    'blacklist_grace_period' => (int) env('JWT_BLACKLIST_GRACE_PERIOD', 30),

    'decrypt_cookies' => false,

    'providers' => [
        'jwt' => PHPOpenSourceSaver\JWTAuth\Providers\JWT\Lcobucci::class,
        'auth' => PHPOpenSourceSaver\JWTAuth\Providers\Auth\Illuminate::class,
        'storage' => PHPOpenSourceSaver\JWTAuth\Providers\Storage\Illuminate::class,
    ],
];
