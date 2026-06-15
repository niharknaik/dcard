<?php

use App\Http\Controllers\Api\V1\AdController;
use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CardController;
use App\Http\Controllers\Api\V1\ContentController;
use App\Http\Controllers\Api\V1\ContentReportController;
use App\Http\Controllers\Api\V1\LeadController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\PlanController;
use App\Http\Controllers\Api\V1\PortfolioController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\PublicCardController;
use App\Http\Controllers\Api\V1\ReferralController;
use App\Http\Controllers\Api\V1\RewardController;
use App\Http\Controllers\Api\V1\ServiceController;
use App\Http\Controllers\Api\V1\SocialLinkController;
use App\Http\Controllers\Api\V1\SubscriptionController;
use App\Http\Controllers\Api\V1\TeamController;
use App\Http\Controllers\Api\V1\TemplateController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes (v1)
|--------------------------------------------------------------------------
| This file defines the complete REST surface for the DCard API. Controllers
| are implemented progressively across phases 2–6 under:
|   App\Http\Controllers\Api\V1
|
| Layering: Route -> FormRequest -> Controller -> Service -> Repository.
| Auth: JWT (guard "api"). Public endpoints are rate-limited per IP.
|
| Until a controller is implemented in its phase, keep its route group
| commented to keep the application bootable. Uncomment per phase.
*/

Route::prefix('v1')->group(function () {

    /* ---------------- Public (no auth) ---------------- */
    Route::middleware('throttle:public')->group(function () {
        // Public card view (Phase 3) — namespaced under /public to avoid
        // colliding with the authenticated cards/{card} resource routes.
        Route::get('public/cards/{slug}', [PublicCardController::class, 'show']);
        // Visitor interactions (Phase 4)
        Route::post('public/cards/{slug}/leads', [LeadController::class, 'store']);
        Route::post('public/cards/{slug}/events', [AnalyticsController::class, 'record']);
        // UGC report/takedown — a visitor reports a public card (COMPLIANCE §5)
        Route::post('public/cards/{slug}/report', [ContentReportController::class, 'store']);

        // Public plans listing (Phase 5)
        Route::get('plans', [PlanController::class, 'index']);

        // Razorpay webhook — signature-verified, not JWT (Phase 5)
        Route::post('payments/webhook', [PaymentController::class, 'webhook']);

        // CMS content (Phase 6)
        Route::get('content/landing', [ContentController::class, 'landing']);
        Route::get('content/faqs', [ContentController::class, 'faqs']);
        Route::get('content/banners', [ContentController::class, 'banners']);
        Route::get('content/consent', [ContentController::class, 'consent']);
        Route::get('content/pages/{slug}', [ContentController::class, 'page']);
    });

    /* ---------------- Auth (Phase 2) ---------------- */
    Route::prefix('auth')->group(function () {
        Route::middleware('throttle:auth')->group(function () {
            Route::post('register', [AuthController::class, 'register']);
            Route::post('login', [AuthController::class, 'login']);
            Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
            Route::post('reset-password', [AuthController::class, 'resetPassword']);
        });

        Route::middleware('auth:api')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('logout', [AuthController::class, 'logout']);
            Route::post('refresh', [AuthController::class, 'refresh']);
        });
    });

    /* ---------------- Authenticated ---------------- */
    Route::middleware(['auth:api', 'active', 'throttle:api'])->group(function () {

        // Account (Phase 2)
        Route::put('profile', [ProfileController::class, 'update']);
        Route::put('password', [ProfileController::class, 'changePassword']);
        Route::delete('account', [ProfileController::class, 'destroy']);
        Route::get('account/export', [ProfileController::class, 'export']);

        // Cards + nested resources (Phase 3)
        Route::post('cards/{card}/duplicate', [CardController::class, 'duplicate']);
        Route::get('cards/{card}/qr', [CardController::class, 'qr']);
        Route::apiResource('cards', CardController::class);
        Route::apiResource('cards.social-links', SocialLinkController::class)
            ->shallow()
            ->only(['index', 'store', 'update', 'destroy']);

        // Portfolio & services (Phase 4)
        Route::apiResource('cards.portfolio', PortfolioController::class)
            ->shallow()
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['portfolio' => 'portfolio']);
        Route::apiResource('cards.services', ServiceController::class)
            ->shallow()
            ->only(['index', 'store', 'update', 'destroy']);

        // Leads (Phase 4)
        Route::get('leads', [LeadController::class, 'index']);
        Route::get('leads/export', [LeadController::class, 'export']);
        Route::patch('leads/{lead}/read', [LeadController::class, 'markRead']);

        // Analytics (Phase 4)
        Route::get('cards/{card}/analytics', [AnalyticsController::class, 'card']);
        Route::get('analytics/summary', [AnalyticsController::class, 'summary']);

        // Ads (admin-controlled placements)
        Route::get('ads', [AdController::class, 'index']);
        Route::post('ads/{ad}/track', [AdController::class, 'track']);

        // Notifications (Phase 4)
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::patch('notifications/read-all', [NotificationController::class, 'readAll']);
        Route::patch('notifications/{notification}/read', [NotificationController::class, 'markRead']);
        Route::delete('notifications/{notification}', [NotificationController::class, 'destroy']);

        // Subscriptions & payments (Phase 5)
        Route::get('subscription', [SubscriptionController::class, 'current']);
        Route::post('subscriptions/checkout', [SubscriptionController::class, 'checkout']);
        Route::post('payments/verify', [PaymentController::class, 'verify']);
        Route::post('payments/play/verify', [PaymentController::class, 'verifyPlay']);
        Route::get('payments', [PaymentController::class, 'index']);
        Route::get('payments/{payment}/invoice', [PaymentController::class, 'invoice']);

        // Team management — business plan (Phase 5)
        Route::get('team/members', [TeamController::class, 'index']);
        Route::post('team/members', [TeamController::class, 'store']);
        Route::delete('team/members/{member}', [TeamController::class, 'destroy']);
        Route::get('team/analytics', [TeamController::class, 'analytics']);

        // Template Marketplace (literal routes declared before templates/{template})
        Route::get('templates/categories', [TemplateController::class, 'categories']);
        Route::get('templates/mine', [TemplateController::class, 'mine']);
        Route::post('templates/verify', [TemplateController::class, 'verify']);
        Route::post('templates/play/verify', [TemplateController::class, 'verifyPlay']);
        Route::get('templates', [TemplateController::class, 'index']);
        Route::get('templates/{template}', [TemplateController::class, 'show']);
        Route::post('templates/{template}/unlock', [TemplateController::class, 'unlock']);
        Route::post('templates/{template}/apply', [TemplateController::class, 'apply']);

        // Reward wallet
        Route::get('rewards/wallet', [RewardController::class, 'wallet']);
        Route::get('rewards/transactions', [RewardController::class, 'transactions']);
        Route::post('rewards/redeem', [RewardController::class, 'redeem']);

        // Referrals
        Route::get('referrals', [ReferralController::class, 'dashboard']);
        Route::get('referrals/history', [ReferralController::class, 'history']);
    });
});
