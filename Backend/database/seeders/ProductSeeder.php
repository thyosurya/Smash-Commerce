<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $products = [
            [
                'id' => 'r001',
                'name' => 'Astrox 99 Pro',
                'brand' => 'Yonex',
                'category' => 'racket',
                'price' => 2850000,
                'original_price' => 3200000,
                'rating' => 4.9,
                'review_count' => 234,
                'stock' => 15,
                'image' => 'https://images.unsplash.com/photo-1716155249759-b5f068f74e63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
                'badge' => 'Best Seller',
                'description' => 'Engineered for elite attacking players, the Astrox 99 Pro delivers unmatched head-heavy power with Namd graphite technology for explosive smashes.',
                'features' => ['Namd Graphite Technology', 'Speed Flex', 'Built-in T-Joint', 'Isometric Head Shape'],
                'specs' => ['Weight' => '83g', 'Balance' => 'Head Heavy', 'Flex' => 'Stiff', 'Frame' => 'HM Graphite', 'Shaft' => 'HM Graphite'],
                'is_new' => false,
                'is_best_seller' => true,
                'stringable' => true,
            ],
            [
                'id' => 'r002',
                'name' => 'Nanoflare 1000Z',
                'brand' => 'Yonex',
                'category' => 'racket',
                'price' => 3450000,
                'original_price' => 3800000,
                'rating' => 4.8,
                'review_count' => 189,
                'stock' => 8,
                'image' => 'https://images.unsplash.com/photo-1716155249759-b5f068f74e63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
                'badge' => 'New',
                'description' => 'Ultra-fast handling racket with revolutionary Sonic Flare System for lightning-quick defense.',
                'features' => ['Sonic Flare System', 'Rotational Generator System', 'Ultra-Thin Frame', 'Super-Light Shaft'],
                'specs' => ['Weight' => '72g', 'Balance' => 'Head Light', 'Flex' => 'Extra Stiff', 'Frame' => 'HM Graphite', 'Shaft' => 'HM Graphite'],
                'is_new' => true,
                'is_best_seller' => false,
                'stringable' => true,
            ],
            [
                'id' => 's001',
                'name' => 'Power Cushion Eclipsion X2',
                'brand' => 'Yonex',
                'category' => 'shoes',
                'price' => 1650000,
                'original_price' => 1900000,
                'rating' => 4.8,
                'review_count' => 312,
                'stock' => 30,
                'image' => 'https://images.unsplash.com/photo-1727060167812-a53ac9b802d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
                'badge' => 'Best Seller',
                'description' => 'Top-of-the-line badminton shoes with Power Cushion technology for superior shock absorption.',
                'features' => ['Power Cushion Technology', 'Hexagrip Outsole', 'Durable Skin+', 'Round Sole'],
                'specs' => ['Type' => 'Cushion', 'Sole' => 'Rubber', 'Upper' => 'Mesh + Synthetic', 'Width' => 'Medium'],
                'is_new' => false,
                'is_best_seller' => true,
                'stringable' => false,
            ],
            [
                'id' => 'sc001',
                'name' => 'Aerosensa 40',
                'brand' => 'Yonex',
                'category' => 'shuttlecock',
                'price' => 195000,
                'original_price' => 220000,
                'rating' => 4.9,
                'review_count' => 523,
                'stock' => 200,
                'image' => 'https://images.unsplash.com/photo-1765544581327-b5e9055d986c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
                'badge' => 'Most Popular',
                'description' => 'Tournament-grade feather shuttlecock with consistent flight performance.',
                'features' => ['High-Quality Feather', 'Cork Base', 'Tournament Grade', 'Consistent Flight'],
                'specs' => ['Type' => 'Feather', 'Speed' => '77 (Medium)', 'Base' => 'Natural Cork', 'Quantity' => '12 pcs/tube'],
                'is_new' => false,
                'is_best_seller' => true,
                'stringable' => false,
            ],
            [
                'id' => 'st001',
                'name' => 'BG80 Power',
                'brand' => 'Yonex',
                'category' => 'string',
                'price' => 125000,
                'original_price' => 145000,
                'rating' => 4.8,
                'review_count' => 389,
                'stock' => 500,
                'image' => 'https://images.unsplash.com/photo-1773186315376-88aaf9878707?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
                'badge' => 'Top Rated',
                'description' => 'High-repulsion multifilament string for maximum power and durability.',
                'features' => ['High Repulsion Multifilament', 'Wear-Resistant', 'Thin Diameter', 'Power-Oriented'],
                'specs' => ['Gauge' => '0.68mm', 'Length' => '10m', 'Type' => 'Multifilament', 'Tension' => '19-27 lbs'],
                'is_new' => false,
                'is_best_seller' => true,
                'stringable' => false,
            ],
            [
                'id' => 'b001',
                'name' => 'Pro Tournament Bag 12R',
                'brand' => 'Yonex',
                'category' => 'bag',
                'price' => 895000,
                'original_price' => 1050000,
                'rating' => 4.7,
                'review_count' => 178,
                'stock' => 45,
                'image' => 'https://images.unsplash.com/photo-1769911112258-47da2e8eee67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
                'badge' => 'Best Seller',
                'description' => 'Spacious tournament bag holds up to 12 rackets with thermal insulation compartment.',
                'features' => ['12 Racket Capacity', 'Thermal Insulation', 'Shoe Compartment', 'Multiple Pockets'],
                'specs' => ['Capacity' => '12 Rackets', 'Material' => 'Nylon', 'Dimensions' => '78x32x34 cm', 'Weight' => '1.2kg'],
                'is_new' => false,
                'is_best_seller' => true,
                'stringable' => false,
            ],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(['id' => $product['id']], $product);
        }
    }
}
