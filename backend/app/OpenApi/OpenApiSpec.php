<?php

namespace App\OpenApi;

/**
 * Root OpenAPI definition + reusable schemas. swagger-php scans the entire
 * `app/` directory, so per-endpoint annotations may live on their controllers.
 * Representative endpoints are documented here as the canonical pattern; extend
 * the same `@OA\Get/Post/...` blocks to cover every route.
 *
 * @OA\Info(
 *     title="DCard API",
 *     version="1.0.0",
 *     description="Digital Visiting Card SaaS — REST API (JWT auth).",
 *     @OA\Contact(email="info@copg.in")
 * )
 *
 * @OA\Server(url="http://localhost:8000", description="Local")
 * @OA\Server(url="https://api.dcard.app", description="Production")
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 *
 * @OA\Tag(name="Auth", description="Registration, login & tokens")
 * @OA\Tag(name="Cards", description="Digital card management")
 * @OA\Tag(name="Public", description="Public card, leads & events")
 * @OA\Tag(name="Leads", description="Lead inbox & export")
 * @OA\Tag(name="Analytics", description="Card & account analytics")
 * @OA\Tag(name="Notifications", description="In-app notification center")
 * @OA\Tag(name="Billing", description="Plans, subscriptions & payments")
 * @OA\Tag(name="Team", description="Business-plan team management")
 *
 * @OA\Schema(
 *     schema="ApiSuccess",
 *     @OA\Property(property="success", type="boolean", example=true),
 *     @OA\Property(property="message", type="string", example="OK"),
 *     @OA\Property(property="data", type="object", nullable=true)
 * )
 * @OA\Schema(
 *     schema="ApiError",
 *     @OA\Property(property="success", type="boolean", example=false),
 *     @OA\Property(property="message", type="string", example="Validation failed"),
 *     @OA\Property(property="errors", type="object", nullable=true)
 * )
 * @OA\Schema(
 *     schema="User",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Jane Doe"),
 *     @OA\Property(property="email", type="string", example="jane@example.com"),
 *     @OA\Property(property="phone", type="string", nullable=true),
 *     @OA\Property(property="status", type="string", example="active")
 * )
 * @OA\Schema(
 *     schema="Card",
 *     @OA\Property(property="id", type="integer", example=10),
 *     @OA\Property(property="slug", type="string", example="jane-doe"),
 *     @OA\Property(property="full_name", type="string", example="Jane Doe"),
 *     @OA\Property(property="designation", type="string", nullable=true),
 *     @OA\Property(property="company", type="string", nullable=true),
 *     @OA\Property(property="public_url", type="string", example="https://dcard.app/card/jane-doe"),
 *     @OA\Property(property="views_count", type="integer", example=42)
 * )
 */
class OpenApiSpec
{
    /**
     * @OA\Post(
     *     path="/api/v1/auth/register",
     *     tags={"Auth"},
     *     summary="Register a new account",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password","password_confirmation"},
     *             @OA\Property(property="name", type="string", example="Jane Doe"),
     *             @OA\Property(property="email", type="string", example="jane@example.com"),
     *             @OA\Property(property="phone", type="string", example="+919800000000"),
     *             @OA\Property(property="password", type="string", example="Secret@123"),
     *             @OA\Property(property="password_confirmation", type="string", example="Secret@123")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Created", @OA\JsonContent(ref="#/components/schemas/ApiSuccess")),
     *     @OA\Response(response=422, description="Validation error", @OA\JsonContent(ref="#/components/schemas/ApiError"))
     * )
     */
    public function register(): void {}

    /**
     * @OA\Post(
     *     path="/api/v1/auth/login",
     *     tags={"Auth"},
     *     summary="Authenticate and receive a JWT",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", example="jane@example.com"),
     *             @OA\Property(property="password", type="string", example="Secret@123")
     *         )
     *     ),
     *     @OA\Response(response=200, description="OK", @OA\JsonContent(ref="#/components/schemas/ApiSuccess")),
     *     @OA\Response(response=422, description="Invalid credentials")
     * )
     */
    public function login(): void {}

    /**
     * @OA\Get(
     *     path="/api/v1/cards",
     *     tags={"Cards"},
     *     summary="List the authenticated user's cards",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="search", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="per_page", in="query", @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="OK", @OA\JsonContent(ref="#/components/schemas/ApiSuccess")),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     *
     * @OA\Post(
     *     path="/api/v1/cards",
     *     tags={"Cards"},
     *     summary="Create a card",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"full_name"},
     *             @OA\Property(property="full_name", type="string", example="Jane Doe"),
     *             @OA\Property(property="designation", type="string", example="Founder"),
     *             @OA\Property(property="company", type="string", example="Acme Inc")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Created"),
     *     @OA\Response(response=422, description="Plan limit reached or validation error")
     * )
     */
    public function cards(): void {}

    /**
     * @OA\Get(
     *     path="/api/v1/public/cards/{slug}",
     *     tags={"Public"},
     *     summary="Fetch a public card by slug (records a view)",
     *     @OA\Parameter(name="slug", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="OK", @OA\JsonContent(ref="#/components/schemas/Card")),
     *     @OA\Response(response=404, description="Not found")
     * )
     *
     * @OA\Post(
     *     path="/api/v1/public/cards/{slug}/leads",
     *     tags={"Public"},
     *     summary="Submit a lead to a card",
     *     @OA\Parameter(name="slug", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string", example="Prospect"),
     *             @OA\Property(property="email", type="string", example="prospect@example.com"),
     *             @OA\Property(property="phone", type="string", example="+919800000000"),
     *             @OA\Property(property="message", type="string", example="Interested!")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Lead captured")
     * )
     */
    public function publicCard(): void {}
}
