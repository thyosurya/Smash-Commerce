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
                'badge' => 'Terlaris',
                'description' => 'Dirancang untuk pemain menyerang kelas elite, Astrox 99 Pro memberikan kekuatan kepala berat yang tak tertandingi dengan teknologi grafit Namd untuk smash eksplosif.',
                'features' => ['Teknologi Grafit Namd', 'Speed Flex', 'Built-in T-Joint', 'Kepala Isometrik'],
                'specs' => ['Berat' => '83g', 'Keseimbangan' => 'Kepala Berat', 'Kelenturan' => 'Kaku', 'Rangka' => 'HM Graphite', 'Batang' => 'HM Graphite'],
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
                'badge' => 'Baru',
                'description' => 'Raket super cepat dengan Sonic Flare System revolusioner untuk pertahanan secepat kilat.',
                'features' => ['Sonic Flare System', 'Rotational Generator System', 'Rangka Ultra-Tipis', 'Batang Super Ringan'],
                'specs' => ['Berat' => '72g', 'Keseimbangan' => 'Kepala Ringan', 'Kelenturan' => 'Extra Kaku', 'Rangka' => 'HM Graphite', 'Batang' => 'HM Graphite'],
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
                'badge' => 'Terlaris',
                'description' => 'Sepatu badminton kelas atas dengan teknologi Power Cushion untuk penyerapan kejutan yang superior.',
                'features' => ['Teknologi Power Cushion', 'Sol Hexagrip', 'Durable Skin+', 'Sol Bundar'],
                'specs' => ['Tipe' => 'Bantalan', 'Sol' => 'Karet', 'Bagian Atas' => 'Mesh + Sintetis', 'Lebar' => 'Sedang'],
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
                'badge' => 'Paling Populer',
                'description' => 'Kok bulu kelas turnamen dengan performa terbang yang konsisten.',
                'features' => ['Bulu Berkualitas Tinggi', 'Dasar Gabus', 'Kelas Turnamen', 'Terbang Konsisten'],
                'specs' => ['Tipe' => 'Bulu', 'Kecepatan' => '77 (Sedang)', 'Dasar' => 'Gabus Alami', 'Isi' => '12 pcs/tube'],
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
                'badge' => 'Terbaik',
                'description' => 'Senar multifilamen berdaya pantur tinggi untuk kekuatan dan ketahanan maksimal.',
                'features' => ['Multifilamen Pantul Tinggi', 'Tahan Aus', 'Diameter Tipis', 'Berorientasi Power'],
                'specs' => ['Ukuran' => '0.68mm', 'Panjang' => '10m', 'Tipe' => 'Multifilament', 'Tegangan' => '19-27 lbs'],
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
                'badge' => 'Terlaris',
                'description' => 'Tas turnamen luas muat hingga 12 raket dengan kompartemen insulasi termal.',
                'features' => ['Kapasitas 12 Raket', 'Insulasi Termal', 'Kompartemen Sepatu', 'Banyak Kantong'],
                'specs' => ['Kapasitas' => '12 Raket', 'Material' => 'Nylon', 'Dimensi' => '78x32x34 cm', 'Berat' => '1.2kg'],
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
