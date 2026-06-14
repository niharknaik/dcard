<?php

use App\Mail\NewLeadMail;
use App\Models\Card;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

it('captures a public lead and notifies the owner', function () {
    Mail::fake();
    $owner = User::factory()->create();
    $card = Card::factory()->for($owner)->create(['slug' => 'acme-co']);

    $this->postJson('/api/v1/public/cards/acme-co/leads', [
        'name' => 'Prospect',
        'email' => 'prospect@example.com',
        'message' => 'Interested in your services.',
    ])->assertCreated();

    $this->assertDatabaseHas('leads', ['card_id' => $card->id, 'email' => 'prospect@example.com']);
    $this->assertDatabaseHas('notifications', ['user_id' => $owner->id, 'type' => 'new_lead']);
    Mail::assertQueued(NewLeadMail::class);
});

it('requires at least an email or phone for a lead', function () {
    $card = Card::factory()->create(['slug' => 'acme-co']);

    $this->postJson('/api/v1/public/cards/acme-co/leads', ['name' => 'NoContact'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['email', 'phone']);
});

it('lists and searches the owner leads', function () {
    $owner = User::factory()->create();
    $token = auth('api')->login($owner);
    $card = Card::factory()->for($owner)->create();
    Lead::factory()->for($card)->create(['name' => 'Alice']);
    Lead::factory()->for($card)->create(['name' => 'Bob']);
    Lead::factory()->create(); // someone else's lead

    $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/leads')
        ->assertOk()
        ->assertJsonCount(2, 'data');

    $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/leads?search=Alice')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

it('marks a lead as read', function () {
    $owner = User::factory()->create();
    $token = auth('api')->login($owner);
    $card = Card::factory()->for($owner)->create();
    $lead = Lead::factory()->for($card)->create(['is_read' => false]);

    $this->withHeader('Authorization', "Bearer {$token}")
        ->patchJson("/api/v1/leads/{$lead->id}/read")
        ->assertOk()
        ->assertJsonPath('data.is_read', true);
});

it('forbids marking another users lead', function () {
    $token = auth('api')->login(User::factory()->create());
    $lead = Lead::factory()->create();

    $this->withHeader('Authorization', "Bearer {$token}")
        ->patchJson("/api/v1/leads/{$lead->id}/read")
        ->assertForbidden();
});
