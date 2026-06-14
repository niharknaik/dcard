<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CardAnalyticsDaily extends Model
{
    protected $table = 'card_analytics_daily';

    protected $fillable = [
        'card_id', 'date', 'views', 'unique_visitors',
        'qr_scans', 'contact_saves', 'link_clicks', 'portfolio_clicks',
    ];

    protected function casts(): array
    {
        return ['date' => 'date'];
    }

    public function card(): BelongsTo
    {
        return $this->belongsTo(Card::class);
    }
}
