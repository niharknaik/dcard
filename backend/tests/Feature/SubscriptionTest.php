<?php

use App\Enums\PaymentStatus;
use App\Enums\SubscriptionStatus;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Services\RazorpayService;
use App\Services\SubscriptionService;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\SubscriptionPlanSeeder;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->seed(SubscriptionPlanSeeder::class);
});

it('lists active plans publicly', function () {
    $this->getJson('/api/v1/plans')
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonFragment(['code' => 'premium']);
});

it('creates a checkout with a razorpay order', function () {
    $this->mock(RazorpayService::class)
        ->shouldReceive('createOrder')->once()
        ->andReturn(['id' => 'order_TEST123', 'amount' => 29900, 'currency' => 'INR', 'status' => 'created']);

    $user = User::factory()->create();
    $token = auth('api')->login($user);
    $plan = SubscriptionPlan::where('code', 'premium')->first();

    $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/subscriptions/checkout', ['plan_id' => $plan->id])
        ->assertCreated()
        ->assertJsonPath('data.order.id', 'order_TEST123');

    $this->assertDatabaseHas('payments', [
        'user_id' => $user->id,
        'razorpay_order_id' => 'order_TEST123',
        'status' => PaymentStatus::Created->value,
    ]);
});

it('rejects checkout for the free plan', function () {
    $user = User::factory()->create();
    $token = auth('api')->login($user);
    $free = SubscriptionPlan::where('code', 'free')->first();

    $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/subscriptions/checkout', ['plan_id' => $free->id])
        ->assertStatus(422);
});

it('verifies a payment and activates the subscription', function () {
    Mail::fake();
    $this->mock(RazorpayService::class)
        ->shouldReceive('verifyPaymentSignature')->once()->andReturnTrue();

    $user = User::factory()->create();
    $token = auth('api')->login($user);
    $plan = SubscriptionPlan::where('code', 'premium')->first();
    $payment = Payment::create([
        'user_id' => $user->id,
        'subscription_plan_id' => $plan->id,
        'transaction_id' => 'TXN-TEST',
        'amount' => $plan->price,
        'currency' => 'INR',
        'status' => PaymentStatus::Created,
        'razorpay_order_id' => 'order_TEST123',
    ]);

    $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/payments/verify', [
            'razorpay_order_id' => 'order_TEST123',
            'razorpay_payment_id' => 'pay_TEST123',
            'razorpay_signature' => 'sig_TEST',
        ])->assertOk()->assertJsonPath('data.status', PaymentStatus::Paid->value);

    $this->assertDatabaseHas('subscriptions', [
        'user_id' => $user->id,
        'subscription_plan_id' => $plan->id,
        'status' => SubscriptionStatus::Active->value,
    ]);
    $this->assertDatabaseHas('notifications', ['user_id' => $user->id, 'type' => 'payment_success']);
    $this->assertNotNull($payment->fresh()->invoice_number);
});

it('rejects a payment with an invalid signature', function () {
    $this->mock(RazorpayService::class)
        ->shouldReceive('verifyPaymentSignature')->once()->andReturnFalse();

    $user = User::factory()->create();
    $token = auth('api')->login($user);
    $plan = SubscriptionPlan::where('code', 'premium')->first();
    Payment::create([
        'user_id' => $user->id, 'subscription_plan_id' => $plan->id,
        'transaction_id' => 'TXN-BAD', 'amount' => $plan->price, 'currency' => 'INR',
        'status' => PaymentStatus::Created, 'razorpay_order_id' => 'order_BAD',
    ]);

    $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/payments/verify', [
            'razorpay_order_id' => 'order_BAD',
            'razorpay_payment_id' => 'pay_BAD',
            'razorpay_signature' => 'bad',
        ])->assertStatus(422);

    $this->assertDatabaseHas('payments', ['razorpay_order_id' => 'order_BAD', 'status' => PaymentStatus::Failed->value]);
});

it('sends expiry reminders for soon-to-expire subscriptions', function () {
    Mail::fake();
    $user = User::factory()->create();
    $plan = SubscriptionPlan::where('code', 'premium')->first();
    Subscription::create([
        'user_id' => $user->id,
        'subscription_plan_id' => $plan->id,
        'status' => SubscriptionStatus::Active,
        'starts_at' => now()->subMonth(),
        'ends_at' => now()->addDays(2),
        'expiry_reminder_sent' => false,
    ]);

    $count = app(SubscriptionService::class)->sendExpiryReminders(3);

    expect($count)->toBe(1);
    $this->assertDatabaseHas('notifications', ['user_id' => $user->id, 'type' => 'subscription_expiring']);
});

it('expires overdue subscriptions', function () {
    $user = User::factory()->create();
    $plan = SubscriptionPlan::where('code', 'premium')->first();
    $sub = Subscription::create([
        'user_id' => $user->id,
        'subscription_plan_id' => $plan->id,
        'status' => SubscriptionStatus::Active,
        'starts_at' => now()->subMonths(2),
        'ends_at' => now()->subDay(),
    ]);

    app(SubscriptionService::class)->expireOverdue();

    expect($sub->fresh()->status)->toBe(SubscriptionStatus::Expired);
});
