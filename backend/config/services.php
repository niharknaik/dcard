<?php

return [
    // Razorpay payment gateway (Phase 5).
    'razorpay' => [
        'key' => env('RAZORPAY_KEY'),
        'secret' => env('RAZORPAY_SECRET'),
        'webhook_secret' => env('RAZORPAY_WEBHOOK_SECRET'),
    ],

    // Google Play Billing server-side verification (Android).
    // Provide the credentials EITHER as raw JSON (service_account_json) OR as a
    // filesystem path to the service-account key file (service_account_path).
    'google_play' => [
        'package_name' => env('GOOGLE_PLAY_PACKAGE_NAME'),
        'service_account_json' => env('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON'),
        'service_account_path' => env('GOOGLE_PLAY_SERVICE_ACCOUNT_PATH'),
    ],
];
