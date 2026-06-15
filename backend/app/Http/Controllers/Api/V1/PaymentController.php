<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\VerifyPaymentRequest;
use App\Http\Requests\Payment\VerifyPlayPaymentRequest;
use App\Http\Resources\V1\PaymentResource;
use App\Models\Payment;
use App\Services\InvoiceService;
use App\Services\PaymentService;
use App\Services\RazorpayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $payments) {}

    /** Verify a completed Razorpay checkout. */
    public function verify(VerifyPaymentRequest $request): JsonResponse
    {
        $payment = $this->payments->verify($request->user(), $request->validated());

        return $this->success(new PaymentResource($payment->load('plan')), 'Payment verified.');
    }

    /** Verify a Google Play Billing subscription purchase (Android). */
    public function verifyPlay(VerifyPlayPaymentRequest $request): JsonResponse
    {
        $payment = $this->payments->verifyPlay($request->user(), $request->validated());

        return $this->success(new PaymentResource($payment->load('plan')), 'Payment verified.');
    }

    /** Razorpay server-to-server webhook (signature-verified, no JWT). */
    public function webhook(Request $request, RazorpayService $razorpay): Response
    {
        $signature = (string) $request->header('X-Razorpay-Signature', '');

        if (! $razorpay->verifyWebhookSignature($request->getContent(), $signature)) {
            Log::warning('Razorpay webhook signature verification failed.');

            return response('Invalid signature', 400);
        }

        $this->payments->handleWebhook($request->json()->all());

        return response('OK', 200);
    }

    /** Authenticated payment history. */
    public function index(Request $request): JsonResponse
    {
        $payments = Payment::where('user_id', $request->user()->id)
            ->with('plan')
            ->latest()
            ->paginate((int) $request->integer('per_page', 15));

        return $this->success(PaymentResource::collection($payments), 'Payments fetched.');
    }

    /** Download a paid payment's invoice PDF. */
    public function invoice(Payment $payment, InvoiceService $invoices): Response
    {
        $this->authorize('view', $payment);

        abort_unless(
            $payment->status === PaymentStatus::Paid,
            404,
            'Invoice is only available for completed payments.'
        );

        return $invoices->pdf($payment)->download("invoice-{$payment->invoice_number}.pdf");
    }
}
