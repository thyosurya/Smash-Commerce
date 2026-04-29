<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class StringingServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $serviceFee = 30000;

        $services = [
            [
                'id' => 'service-st001',
                'name' => 'Jasa Pasang Senar + BG80 Power',
                'brand' => 'Smash Commerce',
                'category' => 'string',
                'price' => 125000 + $serviceFee,
                'original_price' => 145000 + $serviceFee,
                'rating' => 5.0,
                'review_count' => 0,
                'stock' => 999,
                'image' => 'https://images.unsplash.com/photo-1773186315376-88aaf9878707?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
                'badge' => 'Service',
                'description' => 'Layanan jasa pasang senar menggunakan mesin digital untuk senar BG80 Power.',
                'features' => ['Mesin Digital Akurat', 'Dikerjakan Profesional', 'Pilihan Tension Lengkap'],
                'specs' => ['Type' => 'Service'],
                'is_new' => true,
                'is_best_seller' => false,
                'stringable' => false,
            ],
            [
                'id' => 'service-st002',
                'name' => 'Jasa Pasang Senar + Nanogy 99',
                'brand' => 'Smash Commerce',
                'category' => 'string',
                'price' => 165000 + $serviceFee,
                'original_price' => null,
                'rating' => 5.0,
                'review_count' => 0,
                'stock' => 999,
                'image' => 'https://images.unsplash.com/photo-1773186315376-88aaf9878707?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
                'badge' => 'Service',
                'description' => 'Layanan jasa pasang senar menggunakan mesin digital untuk senar Nanogy 99.',
                'features' => ['Mesin Digital Akurat', 'Dikerjakan Profesional', 'Pilihan Tension Lengkap'],
                'specs' => ['Type' => 'Service'],
                'is_new' => true,
                'is_best_seller' => false,
                'stringable' => false,
            ],
            [
                'id' => 'service-st003',
                'name' => 'Jasa Pasang Senar + Aerobite',
                'brand' => 'Smash Commerce',
                'category' => 'string',
                'price' => 155000 + $serviceFee,
                'original_price' => null,
                'rating' => 5.0,
                'review_count' => 0,
                'stock' => 999,
                'image' => 'https://images.unsplash.com/photo-1773186315376-88aaf9878707?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
                'badge' => 'Service',
                'description' => 'Layanan jasa pasang senar menggunakan mesin digital untuk senar Aerobite.',
                'features' => ['Mesin Digital Akurat', 'Dikerjakan Profesional', 'Pilihan Tension Lengkap'],
                'specs' => ['Type' => 'Service'],
                'is_new' => true,
                'is_best_seller' => false,
                'stringable' => false,
            ]
        ];

        foreach ($services as $service) {
            Product::updateOrCreate(['id' => $service['id']], $service);
        }
    }
}
