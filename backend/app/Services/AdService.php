<?php

namespace App\Services;

use App\Models\Ad;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

/**
 * Resolves which ads (house ads + AdMob fallback) a user should see.
 *
 * Monetisation rule: only FREE users see ads. Any user with an active paid
 * subscription (plan code != free) is ad-free.
 */
class AdService
{
    /**
     * Build the full ads payload for a user: global eligibility, AdMob config,
     * and the chosen house ad per placement (or null → AdMob fallback in-app).
     *
     * @return array<string, mixed>
     */
    public function payloadFor(User $user): array
    {
        $eligible = (bool) Setting::get('ads_enabled', true) && ! $this->isPaid($user);

        $android = Setting::get('admob_android_banner_id');
        $ios = Setting::get('admob_ios_banner_id');
        $admobEnabled = $eligible
            && (bool) Setting::get('admob_enabled', false)
            && ($android || $ios);

        $placements = [];
        foreach (Ad::PLACEMENTS as $placement) {
            $placements[$placement] = $eligible ? $this->houseAd($placement) : null;
        }

        return [
            'enabled' => $eligible,
            'admob' => [
                'enabled' => $admobEnabled,
                'android_banner_unit_id' => $android,
                'ios_banner_unit_id' => $ios,
            ],
            'placements' => $placements,
        ];
    }

    private function houseAd(string $placement): ?array
    {
        $ad = Ad::query()->active()->forPlacement($placement)->forAudience('free')->first();

        if (! $ad) {
            return null;
        }

        return [
            'id' => $ad->id,
            'title' => $ad->title,
            'image' => $ad->image ? Storage::disk('public')->url($ad->image) : null,
            'link' => $ad->link,
        ];
    }

    private function isPaid(User $user): bool
    {
        return $user->subscriptions()
            ->where('status', 'active')
            ->whereHas('plan', fn ($q) => $q->where('code', '!=', 'free'))
            ->exists();
    }
}
