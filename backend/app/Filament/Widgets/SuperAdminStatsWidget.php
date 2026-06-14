<?php

namespace App\Filament\Widgets;

use App\Models\ActivityLog;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

/**
 * Privileged overview shown only to super administrators.
 */
class SuperAdminStatsWidget extends BaseWidget
{
    protected static ?int $sort = 0;

    public static function canView(): bool
    {
        return (bool) auth()->user()?->isSuperAdmin();
    }

    protected function getStats(): array
    {
        $superAdmins = User::whereHas('roles', fn ($q) => $q->where('name', 'super_admin'))->count();

        return [
            Stat::make('Administrators', User::where('is_admin', true)->count())
                ->description($superAdmins.' super admin'.($superAdmins === 1 ? '' : 's'))
                ->descriptionIcon('heroicon-m-shield-check')
                ->color('primary'),
            Stat::make('Suspended Users', User::where('status', 'suspended')->count())
                ->descriptionIcon('heroicon-m-lock-closed')
                ->color('danger'),
            Stat::make('Roles', Role::count())
                ->description(Permission::count().' permissions')
                ->color('warning'),
            Stat::make('Audit Events (24h)', ActivityLog::where('created_at', '>=', now()->subDay())->count())
                ->descriptionIcon('heroicon-m-clipboard-document-list')
                ->color('success'),
        ];
    }
}
