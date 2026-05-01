<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendOrderWhatsApp;
use App\Models\AuditLog;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    private const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'ready_for_pickup', 'picked_up'];

    /**
     * List all orders (admin view) with optional filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::query()->with(['items', 'user']);

        // Filter by status
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        // Filter by shipping method
        if ($method = $request->query('shipping_method')) {
            $query->where('shipping_method', $method);
        }

        // Search by order id or user name/email
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%"));
            });
        }

        $orders = $query->latest()->paginate(20);

        return response()->json([
            'data' => $orders->map(fn(Order $o) => $this->formatOrder($o)),
            'meta' => [
                'total'        => $orders->total(),
                'current_page' => $orders->currentPage(),
                'last_page'    => $orders->lastPage(),
                'per_page'     => $orders->perPage(),
            ],
        ]);
    }

    /**
     * Update order status (and optional tracking number / admin note).
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $order = Order::query()->with(['items', 'user'])->findOrFail($id);
        $previousStatus = $order->status;
        $previousTracking = $order->tracking_number;

        $validated = $request->validate([
            'status'          => ['required', Rule::in(self::VALID_STATUSES)],
            'trackingNumber'  => ['nullable', 'string', 'max:80'],
            'adminNote'       => ['nullable', 'string', 'max:500'],
        ]);

        $order->status = $validated['status'];

        if (array_key_exists('trackingNumber', $validated)) {
            $order->tracking_number = $validated['trackingNumber'];
        }

        if (array_key_exists('adminNote', $validated)) {
            $order->admin_note = $validated['adminNote'];
        }

        $order->save();

        AuditLog::query()->create([
            'user_id' => $request->user()?->id,
            'type'    => 'order',
            'action'  => 'Updated order status',
            'detail'  => sprintf(
                'Order %s: %s → %s',
                $order->id,
                $previousStatus,
                $validated['status']
            ),
            'meta' => [
                'orderId'        => $order->id,
                'previousStatus' => $previousStatus,
                'newStatus'      => $validated['status'],
                'trackingNumber' => $order->tracking_number,
            ],
        ]);

        // ── Kirim notifikasi WA ke pelanggan (async) ──────────────────
        $customerPhone = $order->user?->phone ?? '';
        $trackingChanged = array_key_exists('trackingNumber', $validated) && $validated['trackingNumber'] !== $previousTracking;

        if (!empty(trim($customerPhone)) && ($validated['status'] !== $previousStatus || $trackingChanged)) {
            SendOrderWhatsApp::dispatch(
                $order->id,
                $validated['status'],
                $customerPhone,
                $order->user?->name ?? 'Pelanggan',
            );
        }

        return response()->json([
            'message' => 'Status pesanan berhasil diperbarui.',
            'data'    => $this->formatOrder($order->fresh(['items', 'user'])),
        ]);
    }

    /* ─── Stats summary ──────────────────────────────────────────── */
    public function stats(): JsonResponse
    {
        $counts = Order::query()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return response()->json([
            'data' => [
                'pending'          => (int) ($counts['pending']          ?? 0),
                'processing'       => (int) ($counts['processing']       ?? 0),
                'shipped'          => (int) ($counts['shipped']          ?? 0),
                'delivered'        => (int) ($counts['delivered']        ?? 0),
                'ready_for_pickup' => (int) ($counts['ready_for_pickup'] ?? 0),
                'picked_up'        => (int) ($counts['picked_up']        ?? 0),
                'cancelled'        => (int) ($counts['cancelled']        ?? 0),
                'total'            => (int) $counts->sum(),
            ],
        ]);
    }

    /* ─── Helpers ─────────────────────────────────────────────────── */
    private function formatOrder(Order $order): array
    {
        return [
            'id'             => $order->id,
            'date'           => $order->created_at?->toDateString(),
            'createdAt'      => $order->created_at?->toISOString(),
            'status'         => $order->status,
            'shippingMethod' => $order->shipping_method ?? 'delivery',
            'adminNote'      => $order->admin_note,
            'user'           => $order->user ? [
                'id'    => $order->user->id,
                'name'  => $order->user->name,
                'email' => $order->user->email,
                'phone' => $order->user->phone ?? '-',
            ] : null,
            'items'  => $order->items->map(fn($item) => [
                'product' => [
                    'id'       => $item->product_id,
                    'name'     => $item->product_name,
                    'image'    => $item->product_image,
                    'brand'    => $item->product_brand,
                    'category' => $item->product_category,
                    'price'    => (int) $item->price,
                    'rating'      => 0,
                    'reviewCount' => 0,
                    'stock'       => 0,
                    'description' => '',
                    'features'    => [],
                    'specs'       => [],
                ],
                'quantity'      => (int) $item->quantity,
                'price'         => (int) $item->price,
                'customization' => $item->customization,
            ]),
            'subtotal'       => (int) $order->subtotal,
            'shipping'       => (int) $order->shipping,
            'discount'       => (int) $order->discount,
            'total'          => (int) $order->total,
            'address'        => $order->address,
            'paymentMethod'  => $order->payment_method,
            'trackingNumber' => $order->tracking_number,
        ];
    }
}
