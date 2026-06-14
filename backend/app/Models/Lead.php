<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lead extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'card_id', 'name', 'email', 'phone', 'message',
        'source', 'ip_address', 'is_read',
    ];

    protected function casts(): array
    {
        return ['is_read' => 'boolean'];
    }

    public function card(): BelongsTo
    {
        return $this->belongsTo(Card::class);
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }
}
