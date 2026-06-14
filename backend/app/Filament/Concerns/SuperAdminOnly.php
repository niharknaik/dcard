<?php

namespace App\Filament\Concerns;

/**
 * Restricts a Filament Resource (navigation, routes and actions) to super
 * administrators only. Use on resources that manage privileged configuration
 * such as roles, permissions and subscription plans.
 */
trait SuperAdminOnly
{
    public static function canAccess(): bool
    {
        return (bool) auth()->user()?->isSuperAdmin();
    }

    public static function canViewAny(): bool
    {
        return (bool) auth()->user()?->isSuperAdmin();
    }
}
