<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Permissions grouped by admin module.
        $groups = [
            'users' => ['users.view', 'users.manage', 'users.suspend', 'users.delete'],
            'subscriptions' => ['subscriptions.view', 'subscriptions.manage'],
            'payments' => ['payments.view', 'payments.refund', 'payments.export'],
            'content' => ['content.manage'],
            'templates' => ['templates.manage'],
            'rewards' => ['rewards.manage'],
            'reports' => ['reports.view', 'reports.export'],
            // Super-admin-only modules.
            'access' => ['roles.view', 'roles.manage', 'permissions.manage'],
            'plans' => ['plans.manage'],
            'audit' => ['audit.view'],
            'settings' => ['settings.manage'],
        ];

        $permissionIds = [];
        foreach ($groups as $group => $names) {
            foreach ($names as $name) {
                $permission = Permission::firstOrCreate(
                    ['name' => $name],
                    ['label' => ucwords(str_replace(['.', '_'], ' ', $name)), 'group' => $group]
                );
                $permissionIds[] = $permission->id;
            }
        }

        // Permissions reserved for super administrators only.
        $superAdminOnly = ['roles.manage', 'permissions.manage', 'plans.manage', 'settings.manage'];

        // Roles.
        $superAdmin = Role::firstOrCreate(
            ['name' => 'super_admin'],
            ['label' => 'Super Administrator', 'description' => 'Full system access incl. roles, plans, settings and audit log.']
        );
        $admin = Role::firstOrCreate(['name' => 'admin'], ['label' => 'Administrator']);
        Role::firstOrCreate(['name' => 'user'], ['label' => 'User']);
        Role::firstOrCreate(['name' => 'manager'], ['label' => 'Team Manager']);

        // Super admin gets every permission.
        $superAdmin->permissions()->sync($permissionIds);

        // Admin gets everything except the super-admin-only permissions.
        $adminPermissionIds = Permission::whereNotIn('name', $superAdminOnly)->pluck('id')->all();
        $admin->permissions()->sync($adminPermissionIds);
    }
}
