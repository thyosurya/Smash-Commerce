<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $this->validatePayload($request, true);

        $product = Product::query()->create($data);

        $this->createAuditLog(
            request: $request,
            type: 'product',
            action: 'Created product',
            detail: sprintf('%s (%s) ditambahkan ke katalog.', $product->name, $product->id),
            meta: [
                'productId' => $product->id,
                'name' => $product->name,
                'price' => $product->price,
                'stock' => $product->stock,
            ],
        );

        return response()->json([
            'message' => 'Product created successfully.',
            'data' => $this->formatProduct($product),
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $product = Product::query()->findOrFail($id);
        $before = $product->replicate();
        $data = $this->validatePayload($request, false, $product->id);

        $product->fill($data);
        $product->save();

        $changeType = 'product';
        if ($before->price !== $product->price || $before->original_price !== $product->original_price) {
            $changeType = 'price';
        } elseif ($before->stock !== $product->stock) {
            $changeType = 'stock';
        }

        $this->createAuditLog(
            request: $request,
            type: $changeType,
            action: 'Updated product',
            detail: sprintf('%s (%s) diperbarui.', $product->name, $product->id),
            meta: [
                'productId' => $product->id,
                'before' => [
                    'price' => $before->price,
                    'originalPrice' => $before->original_price,
                    'stock' => $before->stock,
                ],
                'after' => [
                    'price' => $product->price,
                    'originalPrice' => $product->original_price,
                    'stock' => $product->stock,
                ],
            ],
        );

        return response()->json([
            'message' => 'Product updated successfully.',
            'data' => $this->formatProduct($product->fresh()),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $product = Product::query()->findOrFail($id);
        $userId = request()->user()?->id;
        $name = $product->name;
        $productId = $product->id;
        $product->delete();

        AuditLog::query()->create([
            'user_id' => $userId,
            'type' => 'product',
            'action' => 'Deleted product',
            'detail' => sprintf('%s (%s) dihapus dari katalog.', $name, $productId),
            'meta' => [
                'productId' => $productId,
                'name' => $name,
            ],
        ]);

        return response()->json([
            'message' => 'Product deleted successfully.',
        ]);
    }

    private function createAuditLog(Request $request, string $type, string $action, string $detail, array $meta = []): void
    {
        AuditLog::query()->create([
            'user_id' => $request->user()?->id,
            'type' => $type,
            'action' => $action,
            'detail' => $detail,
            'meta' => $meta,
        ]);
    }

    private function validatePayload(Request $request, bool $isCreate, ?string $currentId = null): array
    {
        $requiredRule = $isCreate ? ['required'] : ['sometimes'];

        $validated = $request->validate([
            'id' => [
                ...$requiredRule,
                'string',
                'max:50',
                Rule::unique('products', 'id')->ignore($currentId, 'id'),
            ],
            'name' => [...$requiredRule, 'string', 'max:255'],
            'brand' => [...$requiredRule, 'string', 'max:255'],
            'category' => [...$requiredRule, Rule::in(['racket', 'shoes', 'shuttlecock', 'string', 'bag', 'jersey'])],
            'price' => [...$requiredRule, 'integer', 'min:0'],
            'originalPrice' => ['nullable', 'integer', 'min:0'],
            'rating' => [...$requiredRule, 'numeric', 'min:0', 'max:5'],
            'reviewCount' => [...$requiredRule, 'integer', 'min:0'],
            'stock' => [...$requiredRule, 'integer', 'min:0'],
            'image' => [...$requiredRule, 'url'],
            'badge' => ['nullable', 'string', 'max:100'],
            'description' => [...$requiredRule, 'string'],
            'features' => [...$requiredRule, 'array'],
            'features.*' => ['string'],
            'specs' => [...$requiredRule, 'array'],
            'isNew' => ['sometimes', 'boolean'],
            'isBestSeller' => ['sometimes', 'boolean'],
            'stringable' => ['sometimes', 'boolean'],
        ]);

        if (!array_key_exists('isNew', $validated) && $isCreate) {
            $validated['isNew'] = false;
        }

        if (!array_key_exists('isBestSeller', $validated) && $isCreate) {
            $validated['isBestSeller'] = false;
        }

        if (!array_key_exists('stringable', $validated) && $isCreate) {
            $validated['stringable'] = false;
        }

        $map = [
            'id' => 'id',
            'name' => 'name',
            'brand' => 'brand',
            'category' => 'category',
            'price' => 'price',
            'originalPrice' => 'original_price',
            'rating' => 'rating',
            'reviewCount' => 'review_count',
            'stock' => 'stock',
            'image' => 'image',
            'badge' => 'badge',
            'description' => 'description',
            'features' => 'features',
            'specs' => 'specs',
            'isNew' => 'is_new',
            'isBestSeller' => 'is_best_seller',
            'stringable' => 'stringable',
        ];

        $payload = [];

        foreach ($map as $inputKey => $dbKey) {
            if (array_key_exists($inputKey, $validated)) {
                $payload[$dbKey] = $validated[$inputKey];
            }
        }

        if ($isCreate && !array_key_exists('id', $payload)) {
            $payload['id'] = $currentId;
        }

        return $payload;
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
