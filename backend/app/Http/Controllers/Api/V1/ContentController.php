<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Faq;
use App\Models\Page;
use App\Models\Setting;
use App\Support\LandingContent;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ContentController extends Controller
{
    private const DEFAULT_CONSENT = 'I agree that DCard stores my information to create and maintain my digital card, and will not use it for any other purpose without my permission.';

    /** Editable marketing content for the web landing page. */
    public function landing(): JsonResponse
    {
        return $this->success(LandingContent::current(), 'Landing content fetched.');
    }

    public function faqs(): JsonResponse
    {
        $faqs = Cache::remember('content.faqs', 600, fn () => Faq::published()->get(['id', 'question', 'answer', 'category']));

        return $this->success($faqs, 'FAQs fetched.');
    }

    public function page(string $slug): JsonResponse
    {
        $page = Page::where('slug', $slug)->where('is_published', true)->first(['title', 'slug', 'content', 'updated_at']);

        abort_if($page === null, 404, 'Page not found.');

        return $this->success($page, 'Page fetched.');
    }

    public function banners(): JsonResponse
    {
        $banners = Banner::active()->get(['id', 'title', 'image', 'link']);

        $banners->transform(function (Banner $banner) {
            $banner->image = \Illuminate\Support\Facades\Storage::disk('public')->url($banner->image);

            return $banner;
        });

        return $this->success($banners, 'Banners fetched.');
    }

    /** Editable user consent agreement shown on login / sign-up. */
    public function consent(): JsonResponse
    {
        return $this->success(['text' => Setting::get('consent_agreement', self::DEFAULT_CONSENT)], 'Consent agreement fetched.');
    }
}
