<?php

namespace App\Services;

use App\Models\Card;
use App\Models\Template;
use App\Models\TemplatePurchase;
use App\Models\User;
use App\Repositories\Contracts\TemplateRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

/**
 * Read-side of the marketplace: browsing/previewing templates and applying an
 * unlocked template to a card. Purchasing/unlocking lives in TemplatePurchaseService.
 */
class TemplateService
{
    public function __construct(private readonly TemplateRepositoryInterface $templates) {}

    public function browse(User $user, array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $paginator = $this->templates->paginate($filters, $perPage);
        $owned = $this->ownedTemplateIds($user);

        $paginator->getCollection()->transform(function (Template $template) use ($owned) {
            $template->setAttribute('is_unlocked', $template->isFreeToUnlock() || $owned->contains($template->id));

            return $template;
        });

        return $paginator;
    }

    public function show(User $user, Template $template): Template
    {
        $template->setAttribute('is_unlocked', $this->isUnlocked($user, $template));

        return $template->load('category');
    }

    public function ownedTemplateIds(User $user): Collection
    {
        return TemplatePurchase::where('user_id', $user->id)
            ->completed()
            ->pluck('template_id');
    }

    public function isUnlocked(User $user, Template $template): bool
    {
        if ($template->isFreeToUnlock()) {
            return true;
        }

        return TemplatePurchase::where('user_id', $user->id)
            ->where('template_id', $template->id)
            ->completed()
            ->exists();
    }

    /**
     * Apply an unlocked template to one of the user's cards, optionally with a
     * custom primary colour (stored in the card's theme so it drives rendering).
     */
    public function applyToCard(User $user, Card $card, Template $template, ?string $color = null): Card
    {
        if (! $this->isUnlocked($user, $template)) {
            throw ValidationException::withMessages([
                'template' => ['Unlock this template before applying it to a card.'],
            ]);
        }

        $theme = $card->theme ?? [];
        $theme['primary'] = $color ?: ($template->color_scheme ?: ($theme['primary'] ?? null));
        // Carry the template's accent colour + font so the public card renders
        // a distinct, on-brand design (not just a recoloured header).
        $config = $template->config ?? [];
        $theme['accent'] = $config['colors']['accent'] ?? ($theme['accent'] ?? null);
        $theme['font'] = $template->font_family ?: ($theme['font'] ?? null);

        $card->forceFill(['template_id' => $template->id, 'theme' => $theme])->save();
        $template->increment('usage_count');

        return $card->fresh(['marketplaceTemplate']);
    }
}
