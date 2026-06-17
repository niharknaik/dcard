<?php

namespace App\Services;

use App\Enums\AnalyticsEventType;
use App\Enums\NotificationType;
use App\Models\AnalyticsEvent;
use App\Models\Card;
use App\Models\CardAnalyticsDaily;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    /** View milestones that trigger an owner notification. */
    private const MILESTONES = [100, 500, 1000, 5000, 10000, 50000, 100000];

    public function __construct(private readonly NotificationService $notifications) {}

    /**
     * Record a single analytics event. For "view" events it also increments the
     * denormalized counter and checks milestones.
     */
    public function record(Card $card, AnalyticsEventType $type, Request $request, array $metadata = []): AnalyticsEvent
    {
        $event = AnalyticsEvent::create([
            'card_id' => $card->id,
            'type' => $type,
            'visitor_hash' => $this->visitorHash($card, $request),
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 512),
            'referrer' => substr((string) $request->headers->get('referer'), 0, 512) ?: null,
            'metadata' => $metadata ?: null,
        ]);

        if ($type === AnalyticsEventType::View) {
            $card->increment('views_count');
            $this->checkMilestone($card->refresh());
        }

        return $event;
    }

    private function checkMilestone(Card $card): void
    {
        $views = (int) $card->views_count;

        if (! in_array($views, self::MILESTONES, true)) {
            return;
        }

        if ($owner = $card->user) {
            $this->notifications->send(
                $owner,
                NotificationType::ViewMilestone,
                'Milestone reached! 🎉',
                "Your card \"{$card->full_name}\" just crossed {$views} views.",
                ['card_id' => $card->id, 'views' => $views],
            );
        }
    }

    /**
     * Per-card analytics: totals + a daily time series for charts.
     */
    public function cardSummary(Card $card, string $period = 'daily'): array
    {
        [$from, $to] = $this->periodRange($period);

        // Roll up today's raw events on-the-fly so the dashboard reflects visits
        // in real time (the scheduled rollup only covers completed days).
        $this->aggregateForDate(now());

        $series = CardAnalyticsDaily::where('card_id', $card->id)
            ->whereBetween('date', [$from->toDateString(), $to->toDateString()])
            ->orderBy('date')
            ->get();

        return [
            'period' => $period,
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'totals' => $this->sumColumns($series),
            'series' => $series->map(fn ($r) => [
                'date' => $r->date->toDateString(),
                'views' => $r->views,
                'unique_visitors' => $r->unique_visitors,
                'qr_scans' => $r->qr_scans,
                'contact_saves' => $r->contact_saves,
                'link_clicks' => $r->link_clicks,
                'portfolio_clicks' => $r->portfolio_clicks,
            ])->values(),
        ];
    }

    /**
     * Account-wide analytics across all of a user's cards.
     */
    public function userSummary(User $user, string $period = 'daily'): array
    {
        [$from, $to] = $this->periodRange($period);
        $cardIds = $user->cards()->pluck('id');

        // Roll up today's raw events on-the-fly so today's visits show immediately.
        $this->aggregateForDate(now());

        $series = CardAnalyticsDaily::whereIn('card_id', $cardIds)
            ->whereBetween('date', [$from->toDateString(), $to->toDateString()])
            ->selectRaw('date,
                SUM(views) as views,
                SUM(unique_visitors) as unique_visitors,
                SUM(qr_scans) as qr_scans,
                SUM(contact_saves) as contact_saves,
                SUM(link_clicks) as link_clicks,
                SUM(portfolio_clicks) as portfolio_clicks')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'period' => $period,
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'cards' => $cardIds->count(),
            'totals' => $this->sumColumns($series),
            'series' => $series->map(fn ($r) => [
                'date' => Carbon::parse($r->date)->toDateString(),
                'views' => (int) $r->views,
                'unique_visitors' => (int) $r->unique_visitors,
                'qr_scans' => (int) $r->qr_scans,
                'contact_saves' => (int) $r->contact_saves,
                'link_clicks' => (int) $r->link_clicks,
                'portfolio_clicks' => (int) $r->portfolio_clicks,
            ])->values(),
        ];
    }

    /**
     * Roll up raw events for a given date into card_analytics_daily.
     * Idempotent: re-running for the same date overwrites that day's row.
     */
    public function aggregateForDate(Carbon $date): int
    {
        $day = $date->toDateString();

        $rows = AnalyticsEvent::query()
            ->whereDate('created_at', $day)
            ->selectRaw('card_id')
            ->selectRaw("SUM(type = ?) as views", [AnalyticsEventType::View->value])
            ->selectRaw("COUNT(DISTINCT CASE WHEN type = ? THEN visitor_hash END) as unique_visitors", [AnalyticsEventType::View->value])
            ->selectRaw("SUM(type = ?) as qr_scans", [AnalyticsEventType::QrScan->value])
            ->selectRaw("SUM(type = ?) as contact_saves", [AnalyticsEventType::ContactSave->value])
            ->selectRaw("SUM(type = ?) as link_clicks", [AnalyticsEventType::LinkClick->value])
            ->selectRaw("SUM(type = ?) as portfolio_clicks", [AnalyticsEventType::PortfolioClick->value])
            ->groupBy('card_id')
            ->get();

        foreach ($rows as $row) {
            CardAnalyticsDaily::updateOrCreate(
                ['card_id' => $row->card_id, 'date' => $day],
                [
                    'views' => (int) $row->views,
                    'unique_visitors' => (int) $row->unique_visitors,
                    'qr_scans' => (int) $row->qr_scans,
                    'contact_saves' => (int) $row->contact_saves,
                    'link_clicks' => (int) $row->link_clicks,
                    'portfolio_clicks' => (int) $row->portfolio_clicks,
                ]
            );
        }

        return $rows->count();
    }

    private function visitorHash(Card $card, Request $request): string
    {
        return hash('sha256', implode('|', [
            $card->id,
            $request->ip(),
            (string) $request->userAgent(),
            now()->toDateString(),
        ]));
    }

    private function periodRange(string $period): array
    {
        $to = now();
        $from = match ($period) {
            'weekly' => now()->subWeeks(12)->startOfWeek(),
            'monthly' => now()->subMonths(12)->startOfMonth(),
            default => now()->subDays(29)->startOfDay(),
        };

        return [$from, $to];
    }

    private function sumColumns($series): array
    {
        return [
            'views' => (int) $series->sum('views'),
            'unique_visitors' => (int) $series->sum('unique_visitors'),
            'qr_scans' => (int) $series->sum('qr_scans'),
            'contact_saves' => (int) $series->sum('contact_saves'),
            'link_clicks' => (int) $series->sum('link_clicks'),
            'portfolio_clicks' => (int) $series->sum('portfolio_clicks'),
        ];
    }
}
