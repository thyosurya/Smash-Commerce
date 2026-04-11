<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::query()
            ->orderByDesc('is_best_seller')
            ->orderByDesc('is_new')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $products->map(fn (Product $product) => $this->formatProduct($product)),
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $product = Product::query()->findOrFail($id);

        return response()->json([
            'data' => $this->formatProduct($product),
        ]);
    }

    private function formatProduct(Product $product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'brand' => $product->brand,
            'category' => $product->category,
            'price' => $product->price,
            'originalPrice' => $product->original_price,
            'rating' => $product->rating,
            'reviewCount' => $product->review_count,
            'stock' => $product->stock,
            'image' => $product->image,
            'badge' => $product->badge,
            'description' => $product->description,
            'features' => $product->features,
            'specs' => $product->specs,
            'isNew' => $product->is_new,
            'isBestSeller' => $product->is_best_seller,
            'stringable' => $product->stringable,
        ];
    }
}
