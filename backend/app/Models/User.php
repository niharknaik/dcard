<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\Concerns\HasRoles;
use App\Notifications\ResetPasswordNotification;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable, SoftDeletes, HasRoles;

    protected $fillable = [
        'name', 'email', 'phone', 'password', 'avatar',
        'status', 'is_admin', 'default_card_id', 'referral_code', 'referred_by',
        'last_login_at', 'last_login_ip', 'email_verified_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at'     => 'datetime',
            'password'          => 'hashed',
            'is_admin'          => 'boolean',
        ];
    }

    // ---------------- Auth notifications ----------------

    /** Send the queued, frontend-aware password reset email. */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    // ---------------- JWT ----------------

    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [
            'name'     => $this->name,
            'is_admin' => $this->is_admin,
        ];
    }

    // ---------------- Relationships ----------------

    public function cards(): HasMany
    {
        return $this->hasMany(Card::class);
    }

    public function defaultCard(): BelongsTo
    {
        return $this->belongsTo(Card::class, 'default_card_id');
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function activeSubscription(): HasMany
    {
        return $this->hasMany(Subscription::class)->where('status', 'active');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class)->latest();
    }

    public function ownedTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'id', 'owner_id');
    }

    public function team(): HasMany
    {
        return $this->hasMany(Team::class, 'owner_id');
    }

    public function teamMemberships(): HasMany
    {
        return $this->hasMany(TeamMember::class);
    }

    // ---------------- Rewards & referrals ----------------

    public function rewardWallet(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(RewardWallet::class);
    }

    public function rewardTransactions(): HasMany
    {
        return $this->hasMany(RewardTransaction::class)->latest();
    }

    public function templatePurchases(): HasMany
    {
        return $this->hasMany(TemplatePurchase::class);
    }

    /** Referrals this user has made (people they invited). */
    public function referralsMade(): HasMany
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }

    /** The referral record showing who invited this user (if any). */
    public function referredVia(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Referral::class, 'referred_id');
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    /** Current reward points balance (0 when no wallet exists yet). */
    public function rewardBalance(): int
    {
        return (int) ($this->rewardWallet?->balance ?? 0);
    }

    // ---------------- Helpers / Scopes ----------------

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isAdmin(): bool
    {
        return (bool) $this->is_admin;
    }

    /** Super administrators hold the highest privilege (roles, plans, settings). */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    /** Filament panel access — any active admin or super admin. */
    public function canAccessPanel(\Filament\Panel $panel): bool
    {
        return ($this->is_admin || $this->isSuperAdmin()) && $this->isActive();
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
