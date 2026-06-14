<?php

namespace App\Services;

use App\Models\Card;
use App\Models\PortfolioItem;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PortfolioService
{
    public function create(Card $card, array $data): PortfolioItem
    {
        /** @var UploadedFile $file */
        $file = $data['media'];

        $path = $file->store('portfolio/'.$card->id, 'public');

        return $card->portfolioItems()->create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'type' => $data['type'],
            'media_path' => $path,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'sort_order' => $data['sort_order'] ?? (($card->portfolioItems()->max('sort_order') ?? 0) + 1),
        ]);
    }

    public function update(PortfolioItem $item, array $data): PortfolioItem
    {
        if (isset($data['media']) && $data['media'] instanceof UploadedFile) {
            Storage::disk('public')->delete(array_filter([$item->media_path, $item->thumbnail_path]));
            $data['media_path'] = $data['media']->store('portfolio/'.$item->card_id, 'public');
            $data['mime_type'] = $data['media']->getMimeType();
            $data['size'] = $data['media']->getSize();
        }

        unset($data['media']);
        $item->fill($data)->save();

        return $item->refresh();
    }

    public function delete(PortfolioItem $item): void
    {
        Storage::disk('public')->delete(array_filter([$item->media_path, $item->thumbnail_path]));
        $item->delete();
    }
}
