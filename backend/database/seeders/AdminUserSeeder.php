<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@dcard.app')],
            [
                'name' => 'DCard Admin',
                'password' => env('ADMIN_PASSWORD', 'Admin@12345'), // hashed via cast
                'is_admin' => true,
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        if ($role = Role::where('name', 'admin')->first()) {
            $admin->roles()->syncWithoutDetaching($role);
        }

        // Super administrator — full access to roles, plans, settings and audit log.
        $superAdmin = User::updateOrCreate(
            ['email' => env('SUPERADMIN_EMAIL', 'superadmin@dcard.app')],
            [
                'name' => 'DCard Super Admin',
                'password' => env('SUPERADMIN_PASSWORD', 'Super@12345'), // hashed via cast
                'is_admin' => true,
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        if ($superRole = Role::where('name', 'super_admin')->first()) {
            $superAdmin->roles()->syncWithoutDetaching($superRole);
        }
    }
}
