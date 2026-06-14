<?php

namespace App\Services;

use App\Models\Card;
use App\Models\User;
use App\Repositories\Contracts\CardRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class CardService
{
    public function __construct(
        private readonly CardRepositoryInterface $cards,
        private readonly SlugService $slugs,
        private readonly SubscriptionService $subscriptions,
    ) {}

    public function list(User $user, array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->cards->paginateForUser($user->id, $filters, $perPage);
    }

    public function create(User $user, array $data): Card
    {
        $this->assertCanCreate($user);

        return DB::transaction(function () use ($user, $data) {
            $data['user_id'] = $user->id;
            $data['slug'] = $this->slugs->unique($data['slug'] ?? $data['full_name']);

            if (isset($data['profile_photo']) && $data['profile_photo'] instanceof UploadedFile) {
                $data['profile_photo'] = $data['profile_photo']->store('cards/photos', 'public');
            }

            // First card becomes the user's default.
            $isFirst = $user->cards()->count() === 0;
            $data['is_default'] = $isFirst;

            $card = $this->cards->create($data);

            if ($isFirst) {
                $user->forceFill(['default_card_id' => $card->id])->save();
            }

            return $card->fresh();
        });
    }

    public function update(Card $card, array $data): Card
    {
        if (! empty($data['slug']) && $data['slug'] !== $card->slug) {
            $data['slug'] = $this->slugs->unique($data['slug'], ignoreId: $card->id);
        } else {
            unset($data['slug']);
        }

        if (isset($data['profile_photo']) && $data['profile_photo'] instanceof UploadedFile) {
            if ($card->profile_photo) {
                Storage::disk('public')->delete($card->profile_photo);
            }
            $data['profile_photo'] = $data['profile_photo']->store('cards/photos', 'public');
        }

        return $this->cards->update($card, $data);
    }

    public function delete(Card $card): void
    {
        $this->cards->delete($card);
    }

    /**
     * Deep-copy a card (with its social links and services) under a fresh slug.
     */
    public function duplicate(Card $card): Card
    {
        $this->assertCanCreate($card->user);

        return DB::transaction(function () use ($card) {
            $copy = $card->replicate(['views_count', 'is_default']);
            $copy->slug = $this->slugs->unique($card->full_name.' copy');
            $copy->is_default = false;
            $copy->views_count = 0;
            $copy->save();

            foreach ($card->socialLinks as $link) {
                $copy->socialLinks()->create($link->only(['platform', 'url', 'label', 'sort_order', 'is_active']));
            }

            foreach ($card->services as $service) {
                $copy->services()->create($service->only(['name', 'description', 'price', 'currency', 'icon', 'sort_order', 'is_active']));
            }

            return $copy->fresh();
        });
    }

    private function assertCanCreate(User $user): void
    {
        if (! $this->subscriptions->canCreateCard($user)) {
            throw ValidationException::withMessages([
                'plan' => ['Your current plan does not allow creating more cards. Please upgrade to add more.'],
            ]);
        }
    }
}
