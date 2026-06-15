<?php

namespace App\Models;

use App\Enums\ContentReportReason;
use App\Enums\ContentReportStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContentReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'card_id', 'portfolio_item_id', 'reporter_user_id',
        'reporter_name', 'reporter_email', 'reason', 'details',
        'status', 'resolution_note', 'resolved_by', 'resolved_at',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'reason'      => ContentReportReason::class,
            'status'      => ContentReportStatus::class,
            'resolved_at' => 'datetime',
        ];
    }

    // ---------------- Relationships ----------------

    public function card(): BelongsTo
    {
        return $this->belongsTo(Card::class);
    }

    public function portfolioItem(): BelongsTo
    {
        return $this->belongsTo(PortfolioItem::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_user_id');
    }

    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    // ---------------- Scopes ----------------

    public function scopePending($query)
    {
        return $query->where('status', ContentReportStatus::Pending->value);
    }
}
