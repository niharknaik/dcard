<?php

namespace App\Models\Concerns;

use App\Models\Role;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Collection;

/**
 * Lightweight RBAC: roles (many-to-many) -> permissions (many-to-many).
 */
trait HasRoles
{
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    public function hasRole(string $role): bool
    {
        return $this->roles->contains('name', $role);
    }

    public function hasAnyRole(array $roles): bool
    {
        return $this->roles->pluck('name')->intersect($roles)->isNotEmpty();
    }

    public function assignRole(Role|string $role): void
    {
        $role = $role instanceof Role ? $role : Role::where('name', $role)->firstOrFail();
        $this->roles()->syncWithoutDetaching($role);
    }

    public function removeRole(Role|string $role): void
    {
        $roleId = $role instanceof Role ? $role->id : Role::where('name', $role)->value('id');
        $this->roles()->detach($roleId);
    }

    /** All permission names granted via any assigned role. */
    public function permissions(): Collection
    {
        return $this->roles->flatMap->permissions->pluck('name')->unique()->values();
    }

    public function hasPermission(string $permission): bool
    {
        return $this->permissions()->contains($permission);
    }
}
