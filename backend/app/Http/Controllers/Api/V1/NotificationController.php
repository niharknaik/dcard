<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\NotificationResource;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(private readonly NotificationService $notifications) {}

    public function index(Request $request): JsonResponse
    {
        $items = $this->notifications->list($request->user(), (int) $request->integer('per_page', 20));

        return $this->success(NotificationResource::collection($items), 'Notifications fetched.');
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return $this->success(
            ['count' => $this->notifications->unreadCount($request->user())],
            'Unread count fetched.'
        );
    }

    public function markRead(Notification $notification): JsonResponse
    {
        $this->authorize('update', $notification);

        $this->notifications->markRead($notification);

        return $this->success(new NotificationResource($notification->refresh()), 'Notification marked as read.');
    }

    public function readAll(Request $request): JsonResponse
    {
        $count = $this->notifications->markAllRead($request->user());

        return $this->success(['updated' => $count], 'All notifications marked as read.');
    }

    public function destroy(Notification $notification): JsonResponse
    {
        $this->authorize('delete', $notification);

        $this->notifications->delete($notification);

        return $this->success(null, 'Notification deleted.');
    }
}
