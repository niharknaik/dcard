<?php

namespace App\Services;

use App\Models\Card;
use App\Models\Service;

/**
 * Manages the "services" a card offers. Named *OfferingService to avoid
 * colliding with the generic "Service" concept.
 */
class ServiceOfferingService
{
    public function create(Card $card, array $data): Service
    {
        $data['sort_order'] ??= ($card->services()->max('sort_order') ?? 0) + 1;

        return $card->services()->create($data);
    }

    public function update(Service $service, array $data): Service
    {
        $service->fill($data)->save();

        return $service->refresh();
    }

    public function delete(Service $service): void
    {
        $service->delete();
    }
}
