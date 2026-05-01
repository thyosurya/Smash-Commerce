<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\CrmSetting;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StringingController extends Controller
{
    /**
     * List all stringing service products (id starts with 'service-').
     */
    public function index(): JsonResponse
    {
        $services = Product::query()
            ->where('category', 'string')
            ->where('id', 'like', 'service-%')
            ->orderBy('name')
            ->get()
            ->map(fn($p) => $this->formatService($p));

        $fee = $this->getServiceFee();

        return response()->json([
            'data' => $services,
            'serviceFee' => $fee,
        ]);
    }

    /**
     * Get only the service fee.
     */
    public function getFee(): JsonResponse
    {
        return response()->json(['serviceFee' => $this->getServiceFee()]);
    }

    /**
     * Update the base service fee.
     */
    public function updateFee(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'serviceFee' => ['required', 'integer', 'min:0', 'max:500000'],
        ]);

        $setting = $this->getOrCreateSetting();
        $setting->stringing_service_fee = $validated['serviceFee'];
        $setting->save();

        AuditLog::query()->create([
            'user_id'  => $request->user()?->id,
            'type'     => 'crm',
            'action'   => 'Updated stringing service fee',
            'detail'   => sprintf('Biaya jasa pasang senar diubah menjadi Rp %s.', number_format($validated['serviceFee'], 0, ',', '.')),
            'meta'     => ['serviceFee' => $validated['serviceFee']],
        ]);

        return response()->json([
            'message'    => 'Biaya jasa berhasil diperbarui.',
            'serviceFee' => $setting->stringing_service_fee,
        ]);
    }

    /**
     * Create a new stringing service product.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'price'       => ['required', 'integer', 'min:0'],
            'stock'       => ['required', 'integer', 'min:0'],
            'description' => ['required', 'string'],
            'image'       => ['nullable', 'url'],
        ]);

        $slug = strtolower(preg_replace('/\s+/', '-', $validated['name']));
        $id   = 'service-' . $slug . '-' . uniqid();

        $product = Product::query()->create([
            'id'           => $id,
            'name'         => $validated['name'],
            'brand'        => 'Smash Commerce',
            'category'     => 'string',
            'price'        => $validated['price'],
            'original_price' => null,
            'rating'       => 5.0,
            'review_count' => 0,
            'stock'        => $validated['stock'],
            'image'        => $validated['image'] ?? 'https://images.unsplash.com/photo-1773186315376-88aaf9878707?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
            'badge'        => 'Service',
            'description'  => $validated['description'],
            'features'     => ['Mesin Digital Akurat', 'Dikerjakan Profesional', 'Pilihan Tension Lengkap'],
            'specs'        => ['Type' => 'Service'],
            'is_new'       => true,
            'is_best_seller' => false,
            'stringable'   => false,
        ]);

        AuditLog::query()->create([
            'user_id' => $request->user()?->id,
            'type'    => 'product',
            'action'  => 'Created stringing service',
            'detail'  => sprintf('%s (%s) ditambahkan ke layanan stringing.', $product->name, $product->id),
            'meta'    => ['productId' => $product->id, 'name' => $product->name, 'price' => $product->price],
        ]);

        return response()->json([
            'message' => 'Layanan stringing berhasil ditambahkan.',
            'data'    => $this->formatService($product),
        ], 201);
    }

    /**
     * Update an existing stringing service product.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $product = Product::query()
            ->where('id', $id)
            ->where('category', 'string')
            ->firstOrFail();

        $validated = $request->validate([
            'name'        => ['sometimes', 'string', 'max:255'],
            'price'       => ['sometimes', 'integer', 'min:0'],
            'stock'       => ['sometimes', 'integer', 'min:0'],
            'description' => ['sometimes', 'string'],
            'image'       => ['nullable', 'url'],
            'isActive'    => ['sometimes', 'boolean'],
        ]);

        $map = [
            'name'        => 'name',
            'price'       => 'price',
            'stock'       => 'stock',
            'description' => 'description',
            'image'       => 'image',
        ];

        $fill = [];
        foreach ($map as $input => $col) {
            if (array_key_exists($input, $validated)) {
                $fill[$col] = $validated[$input];
            }
        }

        $product->fill($fill);
        $product->save();

        AuditLog::query()->create([
            'user_id' => $request->user()?->id,
            'type'    => 'product',
            'action'  => 'Updated stringing service',
            'detail'  => sprintf('%s (%s) diperbarui.', $product->name, $product->id),
            'meta'    => ['productId' => $product->id, 'changes' => $fill],
        ]);

        return response()->json([
            'message' => 'Layanan stringing berhasil diperbarui.',
            'data'    => $this->formatService($product->fresh()),
        ]);
    }

    /**
     * Delete a stringing service product.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $product = Product::query()
            ->where('id', $id)
            ->where('category', 'string')
            ->firstOrFail();

        $name = $product->name;
        $product->delete();

        AuditLog::query()->create([
            'user_id' => $request->user()?->id,
            'type'    => 'product',
            'action'  => 'Deleted stringing service',
            'detail'  => sprintf('%s (%s) dihapus dari layanan stringing.', $name, $id),
            'meta'    => ['productId' => $id, 'name' => $name],
        ]);

        return response()->json(['message' => 'Layanan stringing berhasil dihapus.']);
    }

    /* ─── Helpers ─────────────────────────────────────────────────── */

    private function getOrCreateSetting(): CrmSetting
    {
        return CrmSetting::query()->firstOrCreate(
            ['id' => 1],
            ['points_per_10000' => 1, 'weekend_bonus_multiplier' => 2, 'review_bonus' => 50, 'first_order_bonus' => 100, 'stringing_service_fee' => 30000, 'tiers' => []]
        );
    }

    private function getServiceFee(): int
    {
        $setting = $this->getOrCreateSetting();
        return (int) ($setting->stringing_service_fee ?? 30000);
    }

    private function formatService(Product $product): array
    {
        return [
            'id'          => $product->id,
            'name'        => $product->name,
            'price'       => $product->price,
            'stock'       => $product->stock,
            'description' => $product->description,
            'image'       => $product->image,
            'rating'      => $product->rating,
            'reviewCount' => $product->review_count,
            'badge'       => $product->badge,
        ];
    }
}
