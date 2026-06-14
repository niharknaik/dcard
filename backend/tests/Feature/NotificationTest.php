<?php

use App\Enums\NotificationType;
use App\Models\User;
use App\Services\NotificationService;

function seedNotifications(User $user, int $count = 3): void
{
    $service = app(NotificationService::class);
    for ($i = 0; $i < $count; $i++) {
        $service->send($user, NotificationType::NewLead, "Title {$i}", "Message {$i}");
    }
}

it('lists notifications and returns the unread count', function () {
    $user = User::factory()->create();
    $token = auth('api')->login($user);
    seedNotifications($user, 3);

    $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/notifications')
        ->assertOk()
        ->assertJsonCount(3, 'data');

    $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/notifications/unread-count')
        ->assertOk()
        ->assertJsonPath('data.count', 3);
});

it('marks all notifications as read', function () {
    $user = User::factory()->create();
    $token = auth('api')->login($user);
    seedNotifications($user, 4);

    $this->withHeader('Authorization', "Bearer {$token}")
        ->patchJson('/api/v1/notifications/read-all')
        ->assertOk()
        ->assertJsonPath('data.updated', 4);

    expect(app(NotificationService::class)->unreadCount($user))->toBe(0);
});

it('deletes a notification it owns', function () {
    $user = User::factory()->create();
    $token = auth('api')->login($user);
    $notification = app(NotificationService::class)->send($user, NotificationType::NewLead, 'T', 'M');

    $this->withHeader('Authorization', "Bearer {$token}")
        ->deleteJson("/api/v1/notifications/{$notification->id}")
        ->assertOk();

    $this->assertDatabaseMissing('notifications', ['id' => $notification->id]);
});

it('forbids deleting another users notification', function () {
    $token = auth('api')->login(User::factory()->create());
    $other = app(NotificationService::class)->send(User::factory()->create(), NotificationType::NewLead, 'T', 'M');

    $this->withHeader('Authorization', "Bearer {$token}")
        ->deleteJson("/api/v1/notifications/{$other->id}")
        ->assertForbidden();
});
