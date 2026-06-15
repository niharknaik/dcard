<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Template\ApplyTemplateRequest;
use App\Http\Requests\Template\UnlockTemplateRequest;
use App\Http\Requests\Template\VerifyPlayTemplatePurchaseRequest;
use App\Http\Requests\Template\VerifyTemplatePaymentRequest;
use App\Http\Resources\V1\CardResource;
use App\Http\Resources\V1\TemplateCategoryResource;
use App\Http\Resources\V1\TemplatePurchaseResource;
use App\Http\Resources\V1\TemplateResource;
use App\Models\Card;
use App\Models\Template;
use App\Models\TemplateCategory;
use App\Services\TemplatePurchaseService;
use App\Services\TemplateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TemplateController extends Controller
{
    public function __construct(
        private readonly TemplateService $templates,
        private readonly TemplatePurchaseService $purchases,
    ) {}

    /** Template categories (with active template counts). */
    public function categories(): JsonResponse
    {
        $categories = TemplateCategory::active()
            ->withCount(['templates' => fn ($q) => $q->where('is_active', true)])
            ->orderBy('sort_order')
            ->get();

        return $this->success(TemplateCategoryResource::collection($categories), 'Categories fetched.');
    }

    /** Browse the marketplace, annotated with per-user unlock status. */
    public function index(Request $request): JsonResponse
    {
        $templates = $this->templates->browse($request->user(), [
            'category_id'   => $request->query('category_id'),
            'category_slug' => $request->query('category'),
            'is_free'       => $request->has('is_free') ? $request->boolean('is_free') : null,
            'search'        => $request->query('search'),
        ], (int) $request->integer('per_page', 20));

        return $this->success(TemplateResource::collection($templates), 'Templates fetched.');
    }

    /** Templates the current user has already unlocked. */
    public function mine(Request $request): JsonResponse
    {
        $purchases = $request->user()->templatePurchases()
            ->completed()
            ->with('template.category')
            ->latest()
            ->paginate((int) $request->integer('per_page', 20));

        return $this->success(TemplatePurchaseResource::collection($purchases), 'Unlocked templates fetched.');
    }

    public function show(Request $request, Template $template): JsonResponse
    {
        abort_unless($template->is_active, 404, 'Template not found.');

        return $this->success(new TemplateResource($this->templates->show($request->user(), $template)), 'Template fetched.');
    }

    /** Unlock a template (free / points / money / mixed). */
    public function unlock(UnlockTemplateRequest $request, Template $template): JsonResponse
    {
        $result = $this->purchases->unlock($request->user(), $template, (string) $request->input('method'));

        return $this->created([
            'status'           => $result['status'],
            'requires_payment' => $result['requires_payment'],
            'purchase'         => new TemplatePurchaseResource($result['purchase']->load('template')),
            'order'            => $result['order'] ?? null,
            'razorpay_key'     => $result['razorpay_key'] ?? null,
        ], $result['requires_payment'] ? 'Checkout created.' : 'Template unlocked.');
    }

    /** Confirm a money/mixed unlock after Razorpay checkout. */
    public function verify(VerifyTemplatePaymentRequest $request): JsonResponse
    {
        $purchase = $this->purchases->verify($request->user(), $request->validated());

        return $this->success(new TemplatePurchaseResource($purchase->load('template')), 'Template unlocked.');
    }

    /** Confirm a Google Play Billing one-time template unlock (Android). */
    public function verifyPlay(VerifyPlayTemplatePurchaseRequest $request): JsonResponse
    {
        $purchase = $this->purchases->verifyPlay($request->user(), $request->validated());

        return $this->success(new TemplatePurchaseResource($purchase->load('template')), 'Template unlocked.');
    }

    /** Apply an unlocked template to one of the user's cards. */
    public function apply(ApplyTemplateRequest $request, Template $template): JsonResponse
    {
        $card = Card::where('user_id', $request->user()->id)->findOrFail($request->integer('card_id'));
        $card = $this->templates->applyToCard($request->user(), $card, $template, $request->input('color'));

        return $this->success(
            new CardResource($card->load(['socialLinks', 'services', 'portfolioItems', 'template', 'marketplaceTemplate'])),
            'Template applied to card.',
        );
    }
}
