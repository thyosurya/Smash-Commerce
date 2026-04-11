<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CrmSetting;
use App\Models\UserPointTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PointController extends Controller
{
    public function earn(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'totalAmount' => ['required', 'integer', 'min:1000'],
            'source' => ['nullable', 'string', 'max:40'],
            'reference' => ['nullable', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:255'],
            'meta' => ['nullable', 'array'],
        ]);

        $user = $request->user();
        $setting = CrmSetting::query()->first();

        $pointsPer10000 = max((int) ($setting?->points_per_10000 ?? 1), 1);
        $basePoints = (int) floor(((int) $validated['totalAmount']) / 10000) * $pointsPer10000;

        if ($basePoints <= 0) {
            return response()->json([
                'message' => 'Nominal belanja belum memenuhi minimum penambahan poin.',
                'data' => [
                    'earnedPoints' => 0,
                    'currentPoints' => (int) $user->points,
                ],
            ]);
        }

        $isFirstTransaction = !$user->pointTransactions()->exists();
        $firstOrderBonus = $isFirstTransaction ? (int) ($setting?->first_order_bonus ?? 0) : 0;
        $earnedPoints = $basePoints + $firstOrderBonus;

        $user->increment('points', $earnedPoints);
        $user->refresh();

        UserPointTransaction::query()->create([
            'user_id' => $user->id,
            'delta_points' => $earnedPoints,
            'balance_after' => (int) $user->points,
            'source' => $validated['source'] ?? 'purchase',
            'reference' => $validated['reference'] ?? null,
            'note' => $validated['note'] ?? null,
            'meta' => array_merge(
                [
                    'totalAmount' => (int) $validated['totalAmount'],
                    'pointsPer10000' => $pointsPer10000,
                    'basePoints' => $basePoints,
                    'firstOrderBonus' => $firstOrderBonus,
                ],
                $validated['meta'] ?? [],
            ),
        ]);

        return response()->json([
            'message' => 'Poin berhasil ditambahkan.',
            'data' => [
                'earnedPoints' => $earnedPoints,
                'currentPoints' => (int) $user->points,
            ],
        ], 201);
    }

    public function history(Request $request): JsonResponse
    {
        $items = $request->user()
            ->pointTransactions()
            ->latest()
            ->limit(50)
            ->get();

        return response()->json([
            'data' => $items->map(fn (UserPointTransaction $item) => [
                'id' => $item->id,
                'deltaPoints' => (int) $item->delta_points,
                'balanceAfter' => (int) $item->balance_after,
                'source' => $item->source,
                'reference' => $item->reference,
                'note' => $item->note,
                'meta' => $item->meta,
                'createdAt' => $item->created_at?->toISOString(),
            ]),
        ]);
    }
}
