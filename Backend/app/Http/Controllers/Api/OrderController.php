<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->with('items')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'data' => $orders->map(fn (Order $order) => $this->formatOrder($order)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.productId' => ['required', 'string', 'max:50'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.customization' => ['nullable', 'array'],
            'address' => ['required', 'string', 'max:500'],
            'paymentMethod' => ['required', 'string', 'max:80'],
            'shipping' => ['required', 'integer', 'min:0'],
            'discount' => ['required', 'integer', 'min:0'],
        ]);

        $user = $request->user();
        $itemsInput = collect($validated['items']);

        $productIds = $itemsInput->pluck('productId')->unique()->values()->all();
        $products = Product::query()->whereIn('id', $productIds)->get()->keyBy('id');

        foreach ($itemsInput as $item) {
            if (!$products->has($item['productId'])) {
                return response()->json([
                    'message' => 'Produk tidak ditemukan: '.$item['productId'],
                ], 422);
            }

            $product = $products->get($item['productId']);
            if ((int) $product->stock < (int) $item['quantity']) {
                return response()->json([
                    'message' => 'Stok tidak cukup untuk produk '.$product->name,
                ], 422);
            }
        }

        $preparedItems = $itemsInput->map(function (array $item) use ($products): array {
            $product = $products->get($item['productId']);

            return [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'product_brand' => $product->brand,
                'product_category' => $product->category,
                'product_image' => $product->image,
                'price' => (int) $product->price,
                'quantity' => (int) $item['quantity'],
                'customization' => $item['customization'] ?? null,
            ];
        });

        $subtotal = (int) $preparedItems->sum(fn (array $item) => $item['price'] * $item['quantity']);
        $shipping = (int) $validated['shipping'];
        $discount = min((int) $validated['discount'], $subtotal + $shipping);
        $total = max($subtotal + $shipping - $discount, 0);

        $order = DB::transaction(function () use ($user, $preparedItems, $validated, $subtotal, $shipping, $discount, $total) {
            $order = Order::query()->create([
                'id' => $this->generateOrderId(),
                'user_id' => $user->id,
                'status' => 'processing',
                'subtotal' => $subtotal,
                'shipping' => $shipping,
                'discount' => $discount,
                'total' => $total,
                'address' => $validated['address'],
                'payment_method' => $validated['paymentMethod'],
                'tracking_number' => 'SMASH'.random_int(1000000, 9999999),
            ]);

            foreach ($preparedItems as $item) {
                $order->items()->create($item);

                Product::query()
                    ->where('id', $item['product_id'])
                    ->decrement('stock', min($item['quantity'], 999999));
            }

            return $order->load('items');
        });

        return response()->json([
            'message' => 'Order berhasil dibuat.',
            'data' => $this->formatOrder($order),
        ], 201);
    }

    private function formatOrder(Order $order): array
    {
        return [
            'id' => $order->id,
            'date' => $order->created_at?->toDateString(),
            'status' => $order->status,
            'items' => $order->items->map(fn ($item) => [
                'product' => [
                    'id' => $item->product_id,
                    'name' => $item->product_name,
                    'image' => $item->product_image,
                    'brand' => $item->product_brand,
                    'category' => $item->product_category,
                    'price' => (int) $item->price,
                    'rating' => 0,
                    'reviewCount' => 0,
                    'stock' => 0,
                    'description' => '',
                    'features' => [],
                    'specs' => [],
                ],
                'quantity' => (int) $item->quantity,
                'price' => (int) $item->price,
                'customization' => $item->customization,
            ]),
            'subtotal' => (int) $order->subtotal,
            'shipping' => (int) $order->shipping,
            'discount' => (int) $order->discount,
            'total' => (int) $order->total,
            'address' => $order->address,
            'paymentMethod' => $order->payment_method,
            'trackingNumber' => $order->tracking_number,
        ];
    }

    private function generateOrderId(): string
    {
        do {
            $id = sprintf('ORD-%s-%03d', now()->format('Y'), random_int(100, 999));
        } while (Order::query()->where('id', $id)->exists());

        return $id;
    }
}
