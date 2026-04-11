<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->updateOrCreate([
            'email' => 'user@smash.com',
        ], [
            'name' => 'Test User',
            'password' => 'user123',
            'role' => 'user',
        ]);

        User::query()->updateOrCreate([
            'email' => 'admin@smash.com',
        ], [
            'name' => 'Admin Smash',
            'password' => 'admin123',
            'role' => 'admin',
        ]);

        $this->call(ProductSeeder::class);
    }
}
