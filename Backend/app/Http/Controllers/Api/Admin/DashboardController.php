<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CrmSetting;
use App\Models\Product;
use App\Models\User;
use App\Models\UserPointTransaction;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::query()
            ->select(['id', 'name', 'brand', 'category', 'price', 'original_price', 'rating', 'review_count', 'stock', 'image', 'badge', 'description', 'features', 'specs', 'is_new', 'is_best_seller', 'stringable', 'created_at'])
            ->get();

        $users = User::query()
            ->select(['id', 'name', 'role', 'points', 'created_at'])
            ->get();

        $now = now();

        $tierDistribution = $this->buildTierDistribution($users, CrmSetting::query()->first());

        $recentPointTransactions = UserPointTransaction::query()
            ->where('created_at', '>=', $now->copy()->subDays(6)->startOfDay())
            ->get();

        $dailyPointFlow = collect(range(6, 0))->map(function (int $daysAgo) use ($recentPointTransactions, $now): array {
            $date = $now->copy()->subDays($daysAgo);
            $dayKey = $date->toDateString();

            $netPoints = (int) $recentPointTransactions
                ->filter(fn (UserPointTransaction $item) => $item->created_at?->toDateString() === $dayKey)
                ->sum('delta_points');

            return [
                'day' => $date->format('D'),
                'netPoints' => $netPoints,
            ];
        })->values();

        $summary = [
            'inventoryValue' => (int) $products->sum(fn (Product $product) => $product->price * $product->stock),
            'totalProducts' => (int) $products->count(),
            'activeUsers' => (int) $users->where('role', 'user')->count(),
            'lowStockProducts' => (int) $products->where('stock', '<', 10)->count(),
            'totalUserPoints' => (int) $users->where('role', 'user')->sum('points'),
            'pointsLast7Days' => (int) $recentPointTransactions->sum('delta_points'),
        ];

        $dailySales = collect(range(6, 0))->map(function (int $daysAgo) use ($products, $users, $now): array {
            $date = $now->copy()->subDays($daysAgo);
            $dayKey = $date->toDateString();

            $sales = (int) $products
                ->filter(fn (Product $product) => $product->created_at?->toDateString() === $dayKey)
                ->sum(fn (Product $product) => $product->price * $product->stock);

            $orders = (int) $users
                ->filter(fn (User $user) => $user->role === 'user' && $user->created_at?->toDateString() === $dayKey)
                ->count();

            return [
                'day' => $date->format('D'),
                'sales' => $sales,
                'orders' => $orders,
            ];
        })->values();

        $monthlySales = collect(range(6, 0))->map(function (int $monthsAgo) use ($products, $users, $now): array {
            $month = $now->copy()->subMonths($monthsAgo);
            $monthKey = $month->format('Y-m');

            $sales = (int) $products
                ->filter(fn (Product $product) => $product->created_at?->format('Y-m') === $monthKey)
                ->sum(fn (Product $product) => $product->price * $product->stock);

            $orders = (int) $users
                ->filter(fn (User $user) => $user->role === 'user' && $user->created_at?->format('Y-m') === $monthKey)
                ->count();

            return [
                'month' => $month->format('M'),
                'sales' => $sales,
                'orders' => $orders,
            ];
        })->values();

        $topProducts = $products
            ->sortByDesc('review_count')
            ->take(4)
            ->values()
            ->map(function (Product $product): array {
                $purchases = max((int) $product->review_count, 0);

                return [
                    'product' => $this->formatProduct($product),
                    'views' => max($purchases * 20, 50),
                    'cartAdds' => max((int) round($purchases * 1.6), 10),
                    'purchases' => $purchases,
                ];
            });

        $topPointUsers = $users
            ->where('role', 'user')
            ->sortByDesc('points')
            ->take(5)
            ->values()
            ->map(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'points' => (int) $user->points,
            ]);

        return response()->json([
            'data' => [
                'summary' => $summary,
                'dailySales' => $dailySales,
                'monthlySales' => $monthlySales,
                'dailyPointFlow' => $dailyPointFlow,
                'userTierDistribution' => $tierDistribution,
                'topPointUsers' => $topPointUsers,
                'topProducts' => $topProducts,
                'generatedAt' => $now->toISOString(),
            ],
        ]);
    }

    private function buildTierDistribution($users, ?CrmSetting $setting): array
    {
        $tiers = collect($setting?->tiers ?? [
            ['name' => 'Newbie', 'minPoints' => 0],
            ['name' => 'Amateur', 'minPoints' => 1000],
            ['name' => 'Pro', 'minPoints' => 5000],
            ['name' => 'Champion', 'minPoints' => 12000],
        ])->values();

        return $tiers->map(function (array $tier, int $index) use ($tiers, $users): array {
            $minPoints = (int) ($tier['minPoints'] ?? 0);
            $nextTier = $tiers->get($index + 1);
            $maxExclusive = $nextTier ? (int) ($nextTier['minPoints'] ?? PHP_INT_MAX) : null;

            $count = $users
                ->where('role', 'user')
                ->filter(function (User $user) use ($minPoints, $maxExclusive): bool {
                    if ($user->points < $minPoints) {
                        return false;
                    }

                    if ($maxExclusive !== null && $user->points >= $maxExclusive) {
                        return false;
                    }

                    return true;
                })
                ->count();

            return [
                'tier' => (string) ($tier['name'] ?? 'Tier'),
                'count' => (int) $count,
                'color' => (string) ($tier['color'] ?? '#94A3B8'),
            ];
        })->all();
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