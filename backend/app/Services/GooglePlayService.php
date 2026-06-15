<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Self-contained Google Play Billing server-side verification client.
 *
 * Runs ALONGSIDE RazorpayService — web stays on Razorpay, Android uses Play
 * Billing. Uses only what ships with Laravel: the Http facade (Guzzle) and
 * ext-openssl for the service-account JWT. No extra composer deps.
 *
 * Credentials come from config('services.google_play.*'): a Google Cloud
 * service-account key (raw JSON or a file path) plus the app package name.
 * Every public method fails closed with a descriptive exception if the purchase
 * cannot be positively verified, so the caller never silently grants access.
 */
class GooglePlayService
{
    private const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

    private const ANDROIDPUBLISHER = 'https://androidpublisher.googleapis.com/androidpublisher/v3';

    private const SCOPE = 'https://www.googleapis.com/auth/androidpublisher';

    private const CACHE_KEY = 'google_play.access_token';

    /** Verify a purchase token as a SUBSCRIPTION purchase. Returns the parsed payload. */
    public function verifySubscription(string $productId, string $token): array
    {
        $package = $this->packageName();

        $url = self::ANDROIDPUBLISHER
            .'/applications/'.rawurlencode($package)
            .'/purchases/subscriptions/'.rawurlencode($productId)
            .'/tokens/'.rawurlencode($token);

        $payload = $this->get($url, 'subscription');

        // paymentState: 0 = pending, 1 = received, 2 = free trial, 3 = pending deferred upgrade.
        $paymentState = $payload['paymentState'] ?? null;
        if ($paymentState !== null && ! in_array((int) $paymentState, [1, 2], true)) {
            throw new RuntimeException('Google Play subscription is not in a paid state.');
        }

        // expiryTimeMillis is a string of epoch ms; reject if already expired.
        $expiry = isset($payload['expiryTimeMillis']) ? (int) $payload['expiryTimeMillis'] : null;
        if ($expiry !== null && $expiry < (int) (microtime(true) * 1000)) {
            throw new RuntimeException('Google Play subscription has expired.');
        }

        return $payload;
    }

    /** Verify a purchase token as a ONE-TIME PRODUCT purchase. Returns the parsed payload. */
    public function verifyProduct(string $productId, string $token): array
    {
        $package = $this->packageName();

        $url = self::ANDROIDPUBLISHER
            .'/applications/'.rawurlencode($package)
            .'/purchases/products/'.rawurlencode($productId)
            .'/tokens/'.rawurlencode($token);

        $payload = $this->get($url, 'product');

        // purchaseState: 0 = purchased, 1 = cancelled, 2 = pending.
        $purchaseState = isset($payload['purchaseState']) ? (int) $payload['purchaseState'] : null;
        if ($purchaseState !== 0) {
            throw new RuntimeException('Google Play product is not in a purchased state.');
        }

        return $payload;
    }

    /** Acknowledge a subscription purchase so Google does not auto-refund it. */
    public function acknowledgeSubscription(string $productId, string $token): void
    {
        $package = $this->packageName();

        $url = self::ANDROIDPUBLISHER
            .'/applications/'.rawurlencode($package)
            .'/purchases/subscriptions/'.rawurlencode($productId)
            .'/tokens/'.rawurlencode($token).':acknowledge';

        $this->post($url, 'subscription acknowledge');
    }

    /** Acknowledge a one-time product purchase so Google does not auto-refund it. */
    public function acknowledgeProduct(string $productId, string $token): void
    {
        $package = $this->packageName();

        $url = self::ANDROIDPUBLISHER
            .'/applications/'.rawurlencode($package)
            .'/purchases/products/'.rawurlencode($productId)
            .'/tokens/'.rawurlencode($token).':acknowledge';

        $this->post($url, 'product acknowledge');
    }

    // ---------------- internals ----------------

    private function get(string $url, string $kind): array
    {
        $response = Http::withToken($this->accessToken())
            ->acceptJson()
            ->get($url);

        if ($response->failed()) {
            throw new RuntimeException(
                "Google Play {$kind} verification failed ({$response->status()}): ".$response->body()
            );
        }

        return (array) $response->json();
    }

    private function post(string $url, string $kind): void
    {
        $response = Http::withToken($this->accessToken())
            ->acceptJson()
            ->post($url, (object) []);

        // Google returns 200 with empty body on a successful acknowledge.
        // 409 means it was already acknowledged — treat as success (idempotent).
        if ($response->failed() && $response->status() !== 409) {
            throw new RuntimeException(
                "Google Play {$kind} failed ({$response->status()}): ".$response->body()
            );
        }
    }

    private function packageName(): string
    {
        $package = config('services.google_play.package_name');

        if (! is_string($package) || $package === '') {
            throw new RuntimeException('Google Play package name is not configured (GOOGLE_PLAY_PACKAGE_NAME).');
        }

        return $package;
    }

    /**
     * Obtain (and cache for ~50 min) an OAuth2 access token by signing a
     * service-account JWT (RS256) and exchanging it at the Google token endpoint.
     */
    private function accessToken(): string
    {
        $cached = Cache::get(self::CACHE_KEY);
        if (is_string($cached) && $cached !== '') {
            return $cached;
        }

        $credentials = $this->credentials();
        $assertion = $this->buildSignedJwt($credentials);

        $response = Http::asForm()->post(self::TOKEN_ENDPOINT, [
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion'  => $assertion,
        ]);

        if ($response->failed()) {
            throw new RuntimeException(
                'Google Play OAuth token exchange failed ('.$response->status().'): '.$response->body()
            );
        }

        $token = $response->json('access_token');
        if (! is_string($token) || $token === '') {
            throw new RuntimeException('Google Play OAuth token exchange returned no access token.');
        }

        // expires_in is typically 3600s; cache slightly under that.
        $expiresIn = (int) ($response->json('expires_in') ?? 3600);
        Cache::put(self::CACHE_KEY, $token, max(60, min(3000, $expiresIn - 60)));

        return $token;
    }

    /** Build and RS256-sign the service-account JWT assertion. */
    private function buildSignedJwt(array $credentials): string
    {
        $clientEmail = $credentials['client_email'] ?? null;
        $privateKey = $credentials['private_key'] ?? null;

        if (! is_string($clientEmail) || $clientEmail === '' || ! is_string($privateKey) || $privateKey === '') {
            throw new RuntimeException('Google Play service-account JSON is missing client_email or private_key.');
        }

        $now = time();
        $header = ['alg' => 'RS256', 'typ' => 'JWT'];
        $claims = [
            'iss'   => $clientEmail,
            'scope' => self::SCOPE,
            'aud'   => self::TOKEN_ENDPOINT,
            'iat'   => $now,
            'exp'   => $now + 3600,
        ];

        $signingInput = $this->base64UrlEncode((string) json_encode($header))
            .'.'.$this->base64UrlEncode((string) json_encode($claims));

        $signature = '';
        $ok = openssl_sign($signingInput, $signature, $privateKey, OPENSSL_ALGO_SHA256);

        if (! $ok || $signature === '') {
            throw new RuntimeException('Failed to RS256-sign the Google Play service-account JWT.');
        }

        return $signingInput.'.'.$this->base64UrlEncode($signature);
    }

    /** Load and decode the service-account credentials from config. */
    private function credentials(): array
    {
        $json = config('services.google_play.service_account_json');

        if (! is_string($json) || $json === '') {
            $path = config('services.google_play.service_account_path');

            if (! is_string($path) || $path === '' || ! is_file($path)) {
                throw new RuntimeException(
                    'Google Play credentials are not configured. Set GOOGLE_PLAY_SERVICE_ACCOUNT_JSON '
                    .'or GOOGLE_PLAY_SERVICE_ACCOUNT_PATH.'
                );
            }

            $json = (string) file_get_contents($path);
        }

        $decoded = json_decode($json, true);

        if (! is_array($decoded)) {
            throw new RuntimeException('Google Play service-account credentials are not valid JSON.');
        }

        return $decoded;
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
