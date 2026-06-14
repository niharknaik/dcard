<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Faq;
use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ContentController extends Controller
{
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
}
