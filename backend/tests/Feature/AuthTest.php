<?php

use App\Models\User;
use App\Mail\WelcomeMail;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

it('registers a new user and returns a token', function () {
    Mail::fake();

    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'password' => 'Secret@123',
        'password_confirmation' => 'Secret@123',
    ]);

    $response->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonStructure(['data' => ['user' => ['id', 'email'], 'token', 'expires_in']]);

    $this->assertDatabaseHas('users', ['email' => 'jane@example.com']);
    Mail::assertQueued(WelcomeMail::class);
});

it('rejects registration with a weak password', function () {
    $this->postJson('/api/v1/auth/register', [
        'name' => 'Jane',
        'email' => 'jane2@example.com',
        'password' => 'weak',
        'password_confirmation' => 'weak',
    ])->assertStatus(422)->assertJsonValidationErrors('password');
});

it('logs in with valid credentials', function () {
    User::factory()->create(['email' => 'john@example.com']);

    $this->postJson('/api/v1/auth/login', [
        'email' => 'john@example.com',
        'password' => 'Password@123',
    ])->assertOk()->assertJsonPath('success', true)
        ->assertJsonStructure(['data' => ['token']]);
});

it('rejects login with invalid credentials', function () {
    User::factory()->create(['email' => 'john@example.com']);

    $this->postJson('/api/v1/auth/login', [
        'email' => 'john@example.com',
        'password' => 'wrong-password',
    ])->assertStatus(422);
});

it('blocks suspended users from logging in', function () {
    User::factory()->suspended()->create(['email' => 'sus@example.com']);

    $this->postJson('/api/v1/auth/login', [
        'email' => 'sus@example.com',
        'password' => 'Password@123',
    ])->assertStatus(422);
});

it('returns the authenticated user profile', function () {
    $user = User::factory()->create();
    $token = auth('api')->login($user);

    $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/auth/me')
        ->assertOk()
        ->assertJsonPath('data.email', $user->email);
});

it('changes the password for an authenticated user', function () {
    $user = User::factory()->create();
    $token = auth('api')->login($user);

    $this->withHeader('Authorization', "Bearer {$token}")
        ->putJson('/api/v1/password', [
            'current_password' => 'Password@123',
            'password' => 'NewSecret@123',
            'password_confirmation' => 'NewSecret@123',
        ])->assertOk();
});
