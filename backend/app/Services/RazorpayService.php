<?php

namespace App\Services;

use Razorpay\Api\Api;
use Razorpay\Api\Errors\SignatureVerificationError;
use RuntimeException;

/**
 * Thin wrapper around the Razorpay PHP SDK. Keeps gateway specifics out of the
 * domain services and makes the gateway mockable in tests.
 */
class RazorpayService
{
    private ?Api $api = null;

    private function api(): Api
    {
        if ($this->api === null) {
            $key = config('services.razorpay.key');
            $secret = config('services.razorpay.secret');

            if (! $key || ! $secret) {
                throw new RuntimeException('Razorpay credentials are not configured.');
            }

            $this->api = new Api($key, $secret);
        }

        return $this->api;
    }

    /**
     * Create a Razorpay order. Amount is in the major unit (e.g. rupees) and is
     * converted to the smallest unit (paise) here.
     *
     * @return array{id:string, amount:int, currency:string, status:string}
     */
    public function createOrder(float $amount, string $currency, string $receipt): array
    {
        $order = $this->api()->order->create([
            'amount' => (int) round($amount * 100),
            'currency' => $currency,
            'receipt' => $receipt,
            'payment_capture' => 1,
        ]);

        return [
            'id' => $order['id'],
            'amount' => $order['amount'],
            'currency' => $order['currency'],
            'status' => $order['status'],
        ];
    }

    /**
     * Verify the checkout signature returned by Razorpay Checkout.
     */
    public function verifyPaymentSignature(string $orderId, string $paymentId, string $signature): bool
    {
        try {
            $this->api()->utility->verifyPaymentSignature([
                'razorpay_order_id' => $orderId,
                'razorpay_payment_id' => $paymentId,
                'razorpay_signature' => $signature,
            ]);

            return true;
        } catch (SignatureVerificationError) {
            return false;
        }
    }

    /**
     * Refund a captured payment. Amount is in the major unit (rupees); pass null
     * for a full refund.
     *
     * @return array{id:string, status:string, amount:int}
     */
    public function refund(string $paymentId, ?float $amount = null): array
    {
        $params = $amount !== null ? ['amount' => (int) round($amount * 100)] : [];

        $refund = $this->api()->payment->fetch($paymentId)->refund($params);

        return [
            'id' => $refund['id'],
            'status' => $refund['status'],
            'amount' => $refund['amount'],
        ];
    }

    /**
     * Verify an incoming webhook payload signature.
     */
    public function verifyWebhookSignature(string $payload, string $signature): bool
    {
        $secret = config('services.razorpay.webhook_secret');

        if (! $secret) {
            return false;
        }

        try {
            $this->api()->utility->verifyWebhookSignature($payload, $signature, $secret);

            return true;
        } catch (SignatureVerificationError) {
            return false;
        }
    }
}
