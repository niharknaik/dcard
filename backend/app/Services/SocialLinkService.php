<?php

namespace App\Services;

use App\Models\Card;
use App\Models\SocialLink;

class SocialLinkService
{
    public function create(Card $card, array $data): SocialLink
    {
        $data['sort_order'] ??= ($card->socialLinks()->max('sort_order') ?? 0) + 1;

        return $card->socialLinks()->create($data);
    }

    public function update(SocialLink $link, array $data): SocialLink
    {
        $link->fill($data)->save();

        return $link->refresh();
    }

    public function delete(SocialLink $link): void
    {
        $link->delete();
    }
}
