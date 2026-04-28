<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class ReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $period = $request->query('period', '30d');
        $status = $request->query('status');
        $category = $request->query('category');
        $paymentMethod = $request->query('paymentMethod');
        $startDateCustom = $request->query('startDate');
        $endDateCustom = $request->query('endDate');
        
        $now = now();
        $startDate = $startDateCustom ? Carbon::parse($startDateCustom)->startOfDay() : $this->resolveStartDate($period, $now);
        $endDate = $endDateCustom ? Carbon::parse($endDateCustom)->endOfDay() : $now;

        $ordersQuery = Order::query()
            ->with([
                'user:id,name,email',
                'items:id,order_id,product_id,product_name,product_brand,product_category,price,quantity',
            ])
            ->latest('created_at');

        if ($startDate !== null) {
            $ordersQuery->where('created_at', '>=', $startDate);
        }
        
        $ordersQuery->where('created_at', '<=', $endDate);

        if ($status !== null && $status !== '') {
            $ordersQuery->where('status', $status);
        }

        if ($paymentMethod !== null && $paymentMethod !== '') {
            $ordersQuery->where('payment_method', $paymentMethod);
        }

        if ($category !== null && $category !== '') {
            $ordersQuery->whereHas('items', fn (Builder $q) => $q->where('product_category', $category), '>', 0);
        }

        $orders = $ordersQuery->get();
        $items = $orders->flatMap(fn (Order $order) => $order->items);

        $summary = [
            'totalSales' => (int) $orders->sum('subtotal'),
            'totalIncome' => (int) $orders->sum('total'),
            'totalTransactions' => (int) $orders->count(),
            'totalDiscount' => (int) $orders->sum('discount'),
            'totalShipping' => (int) $orders->sum('shipping'),
            'totalItemsSold' => (int) $items->sum('quantity'),
            'averageTransaction' => $orders->count() > 0 ? (int) round($orders->avg('total')) : 0,
        ];

        $topProducts = $this->buildTopProducts($items, $summary['totalSales']);
        $transactions = $this->buildTransactions($orders);
        $salesBreakdown = $this->buildSalesBreakdown($orders, $period, $now);
        $paymentMethods = $this->buildSimpleBreakdown($orders, 'payment_method');
        $statusBreakdown = $this->buildSimpleBreakdown($orders, 'status');

        return response()->json([
            'data' => [
                'period' => $period,
                'filters' => [
                    'status' => $status,
                    'category' => $category,
                    'paymentMethod' => $paymentMethod,
                    'startDate' => $startDateCustom,
                    'endDate' => $endDateCustom,
                ],
                'summary' => $summary,
                'salesBreakdown' => $salesBreakdown,
                'topProducts' => $topProducts,
                'transactions' => $transactions,
                'paymentMethods' => $paymentMethods,
                'statusBreakdown' => $statusBreakdown,
                'generatedAt' => $now->toISOString(),
            ],
        ]);
    }

    private function resolveStartDate(string $period, Carbon $now): ?Carbon
    {
        return match ($period) {
            '7d' => $now->copy()->subDays(6)->startOfDay(),
            '30d' => $now->copy()->subDays(29)->startOfDay(),
            '12m' => $now->copy()->subMonths(11)->startOfMonth(),
            'all' => null,
            default => $now->copy()->subDays(29)->startOfDay(),
        };
    }

    private function buildTopProducts(Collection $items, int $totalSales): array
    {
        return $items
            ->groupBy('product_id')
            ->map(function (Collection $group, string $productId) use ($totalSales): array {
                $first = $group->first();
                $quantitySold = (int) $group->sum('quantity');
                $salesAmount = (int) $group->sum(fn (OrderItem $item) => $item->price * $item->quantity);

                return [
                    'productId' => $productId,
                    'name' => (string) $first->product_name,
                    'brand' => (string) ($first->product_brand ?? '-'),
                    'category' => (string) ($first->product_category ?? '-'),
                    'quantitySold' => $quantitySold,
                    'salesAmount' => $salesAmount,
                    'transactionCount' => (int) $group->count(),
                    'contribution' => $totalSales > 0 ? round(($salesAmount / $totalSales) * 100, 2) : 0,
                ];
            })
            ->sortByDesc('quantitySold')
            ->take(10)
            ->values()
            ->all();
    }

    private function buildTransactions(Collection $orders): array
    {
        return $orders
            ->take(100)
            ->map(function (Order $order): array {
                $itemCount = (int) $order->items->sum('quantity');
                $itemSummary = $order->items
                    ->take(2)
                    ->map(fn (OrderItem $item) => sprintf('%s x%d', $item->product_name, $item->quantity))
                    ->implode(', ');

                if ($order->items->count() > 2) {
                    $itemSummary .= sprintf(' +%d item', $order->items->count() - 2);
                }

                return [
                    'id' => $order->id,
                    'date' => $order->created_at?->toISOString(),
                    'customerName' => (string) ($order->user?->name ?? 'Pelanggan'),
                    'customerEmail' => (string) ($order->user?->email ?? '-'),
                    'status' => (string) $order->status,
                    'paymentMethod' => (string) $order->payment_method,
                    'itemCount' => $itemCount,
                    'itemSummary' => $itemSummary,
                    'subtotal' => (int) $order->subtotal,
                    'shipping' => (int) $order->shipping,
                    'discount' => (int) $order->discount,
                    'total' => (int) $order->total,
                    'trackingNumber' => (string) ($order->tracking_number ?? '-'),
                ];
            })
            ->values()
            ->all();
    }

    private function buildSalesBreakdown(Collection $orders, string $period, Carbon $now): array
    {
        $useMonthly = in_array($period, ['12m', 'all'], true);

        if ($useMonthly) {
            $months = collect(range(11, 0))->map(function (int $monthsAgo) use ($now, $orders): array {
                $month = $now->copy()->subMonths($monthsAgo);
                $monthKey = $month->format('Y-m');
                $bucket = $orders->filter(fn (Order $order) => $order->created_at?->format('Y-m') === $monthKey);

                return [
                    'label' => $month->translatedFormat('M Y'),
                    'sales' => (int) $bucket->sum('subtotal'),
                    'income' => (int) $bucket->sum('total'),
                    'transactions' => (int) $bucket->count(),
                    'itemsSold' => (int) $bucket->flatMap(fn (Order $order) => $order->items)->sum('quantity'),
                ];
            });

            if ($period === 'all' && $orders->isNotEmpty()) {
                $firstOrder = $orders->last()?->created_at?->copy()->startOfMonth();
                $lastOrder = $orders->first()?->created_at?->copy()->startOfMonth();

                if ($firstOrder !== null && $lastOrder !== null && $firstOrder->diffInMonths($lastOrder) > 11) {
                    $months = collect();
                    $cursor = $firstOrder->copy();

                    while ($cursor->lte($lastOrder)) {
                        $monthKey = $cursor->format('Y-m');
                        $bucket = $orders->filter(fn (Order $order) => $order->created_at?->format('Y-m') === $monthKey);

                        $months->push([
                            'label' => $cursor->translatedFormat('M Y'),
                            'sales' => (int) $bucket->sum('subtotal'),
                            'income' => (int) $bucket->sum('total'),
                            'transactions' => (int) $bucket->count(),
                            'itemsSold' => (int) $bucket->flatMap(fn (Order $order) => $order->items)->sum('quantity'),
                        ]);

                        $cursor->addMonth();
                    }
                }
            }

            return $months->values()->all();
        }

        $days = $period === '7d' ? 6 : 29;

        return collect(range($days, 0))->map(function (int $daysAgo) use ($now, $orders): array {
            $date = $now->copy()->subDays($daysAgo);
            $dayKey = $date->toDateString();
            $bucket = $orders->filter(fn (Order $order) => $order->created_at?->toDateString() === $dayKey);

            return [
                'label' => $date->translatedFormat('d M'),
                'sales' => (int) $bucket->sum('subtotal'),
                'income' => (int) $bucket->sum('total'),
                'transactions' => (int) $bucket->count(),
                'itemsSold' => (int) $bucket->flatMap(fn (Order $order) => $order->items)->sum('quantity'),
            ];
        })->values()->all();
    }

    private function buildSimpleBreakdown(Collection $orders, string $field): array
    {
        return $orders
            ->groupBy($field)
            ->map(function (Collection $group, string $label): array {
                return [
                    'label' => $label !== '' ? $label : '-',
                    'count' => (int) $group->count(),
                    'amount' => (int) $group->sum('total'),
                ];
            })
            ->sortByDesc('count')
            ->values()
            ->all();
    }
}
