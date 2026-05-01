<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendOrderWhatsApp;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Ambil semua ulasan milik user yang sedang login.
     */
    public function index(Request $request): JsonResponse
    {
        $reviews = Review::query()
            ->where('user_id', $request->user()->id)
            ->with('product')
            ->latest()
            ->get()
            ->map(fn(Review $r) => $this->formatReview($r));

        return response()->json(['data' => $reviews]);
    }

    /**
     * Ambil ulasan untuk satu produk (publik).
     */
    public function forProduct(string $productId): JsonResponse
    {
        $reviews = Review::query()
            ->where('product_id', $productId)
            ->with('user')
            ->latest()
            ->get()
            ->map(fn(Review $r) => [
                'id'         => $r->id,
                'rating'     => $r->rating,
                'comment'    => $r->comment,
                'createdAt'  => $r->created_at?->toIso8601String(),
                'userName'   => $r->user?->name ?? 'Pengguna',
            ]);

        return response()->json(['data' => $reviews]);
    }

    /**
     * Kirim ulasan baru dari user.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'orderId'   => ['required', 'string'],
            'productId' => ['required', 'string'],
            'rating'    => ['required', 'integer', 'min:1', 'max:5'],
            'comment'   => ['nullable', 'string', 'max:1000'],
        ]);

        $user  = $request->user();
        $order = Order::query()
            ->where('id', $validated['orderId'])
            ->where('user_id', $user->id)
            ->whereIn('status', ['delivered', 'picked_up'])
            ->firstOrFail();

        // Pastikan produk ada di order
        $orderItem = $order->items()->where('product_id', $validated['productId'])->first();
        if (!$orderItem) {
            return response()->json(['message' => 'Produk tidak ditemukan di pesanan ini.'], 422);
        }

        // Cek apakah sudah direview
        $exists = Review::query()
            ->where('user_id', $user->id)
            ->where('product_id', $validated['productId'])
            ->where('order_id', $order->id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Kamu sudah mengulas produk ini.'], 422);
        }

        $review = Review::query()->create([
            'user_id'    => $user->id,
            'product_id' => $validated['productId'],
            'order_id'   => $order->id,
            'rating'     => $validated['rating'],
            'comment'    => $validated['comment'] ?? null,
        ]);

        // Update rata-rata rating produk
        $this->recalcProductRating($validated['productId']);

        return response()->json([
            'message' => 'Ulasan berhasil dikirim!',
            'data'    => $this->formatReview($review),
        ], 201);
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private function recalcProductRating(string $productId): void
    {
        $avg = Review::query()
            ->where('product_id', $productId)
            ->avg('rating');

        $count = Review::query()
            ->where('product_id', $productId)
            ->count();

        Product::query()->where('id', $productId)->update([
            'rating'       => round($avg ?? 0, 1),
            'review_count' => $count,
        ]);
    }

    private function formatReview(Review $review): array
    {
        return [
            'id'          => $review->id,
            'orderId'     => $review->order_id,
            'productId'   => $review->product_id,
            'productName' => $review->product?->name ?? $review->product_id,
            'productImage'=> $review->product?->image ?? '',
            'rating'      => $review->rating,
            'comment'     => $review->comment,
            'createdAt'   => $review->created_at?->toIso8601String(),
        ];
    }
}
