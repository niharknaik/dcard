<?php

namespace App\Services;

use App\Enums\NotificationType;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Central in-app notification service (no push, no third-party service).
 * Every domain event that should reach a user funnels through send().
 */
class NotificationService
{
    public function send(User $user, NotificationType $type, string $title, string $message, array $data = []): Notification
    {
        return Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }

    public function list(User $user, int $perPage = 20): LengthAwarePaginator
    {
        return $user->notifications()->paginate($perPage);
    }

    public function unreadCount(User $user): int
    {
        return $user->notifications()->where('is_read', false)->count();
    }

    public function markRead(Notification $notification): void
    {
        $notification->markAsRead();
    }

    public function markAllRead(User $user): int
    {
        return $user->notifications()
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);
    }

    public function delete(Notification $notification): void
    {
        $notification->delete();
    }
}
