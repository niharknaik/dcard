<?php

namespace App\Services;

use App\Enums\NotificationType;
use App\Mail\NewLeadMail;
use App\Models\Card;
use App\Models\Lead;
use App\Models\User;
use App\Repositories\Contracts\LeadRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LeadService
{
    public function __construct(
        private readonly LeadRepositoryInterface $leads,
        private readonly NotificationService $notifications,
    ) {}

    /**
     * Capture a public lead, then notify the card owner in-app and by (queued) email.
     */
    public function capture(Card $card, array $data, ?string $ip = null): Lead
    {
        $lead = $this->leads->create([
            'card_id' => $card->id,
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'message' => $data['message'] ?? null,
            'source' => $data['source'] ?? 'public',
            'ip_address' => $ip,
        ]);

        $owner = $card->user;

        if ($owner) {
            $this->notifications->send(
                $owner,
                NotificationType::NewLead,
                'New lead received',
                "{$lead->name} reached out via your card \"{$card->full_name}\".",
                ['lead_id' => $lead->id, 'card_id' => $card->id],
            );

            if ($owner->email) {
                Mail::to($owner->email)->queue(new NewLeadMail($lead));
            }
        }

        return $lead;
    }

    public function list(User $user, array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->leads->paginateForUser($user->id, $filters, $perPage);
    }

    public function markRead(Lead $lead): Lead
    {
        $lead->forceFill(['is_read' => true])->save();

        return $lead;
    }

    /**
     * Stream a CSV of the user's leads (memory-safe via chunking).
     */
    public function exportCsv(User $user, array $filters): StreamedResponse
    {
        $filename = 'leads-'.now()->format('Y-m-d-His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $query = $this->leads->queryForUser($user->id, $filters)->with('card:id,full_name');

        return response()->stream(function () use ($query) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Card', 'Name', 'Email', 'Phone', 'Message', 'Source', 'Read', 'Date']);

            $query->latest()->chunk(500, function ($leads) use ($handle) {
                foreach ($leads as $lead) {
                    fputcsv($handle, [
                        $lead->card?->full_name,
                        $lead->name,
                        $lead->email,
                        $lead->phone,
                        $lead->message,
                        $lead->source,
                        $lead->is_read ? 'Yes' : 'No',
                        $lead->created_at?->toDateTimeString(),
                    ]);
                }
            });

            fclose($handle);
        }, 200, $headers);
    }
}
