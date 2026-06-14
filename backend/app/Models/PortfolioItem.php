<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class PortfolioItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'card_id', 'title', 'description', 'type',
        'media_path', 'thumbnail_path', 'mime_type', 'size', 'sort_order',
    ];

    protected function casts(): array
    {
        return ['size' => 'integer'];
    }

    public function card(): BelongsTo
    {
        return $this->belongsTo(Card::class);
    }

    public function getMediaUrlAttribute(): ?string
    {
        return $this->media_path ? Storage::url($this->media_path) : null;
    }
}
