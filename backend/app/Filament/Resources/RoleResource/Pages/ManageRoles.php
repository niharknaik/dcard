<?php

namespace App\Filament\Resources\RoleResource\Pages;

use App\Filament\Resources\RoleResource;
use App\Models\ActivityLog;
use App\Models\Role;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageRoles extends ManageRecords
{
    protected static string $resource = RoleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()->after(fn (Role $record) => ActivityLog::record(
                'role.created',
                $record,
                "Created role '{$record->name}'",
            )),
        ];
    }
}
