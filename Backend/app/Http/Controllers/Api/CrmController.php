<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CrmSetting;
use Illuminate\Http\JsonResponse;

class CrmController extends Controller
{
    public function show(): JsonResponse
    {
        $setting = CrmSetting::query()->first();

        return response()->json([
            'data' => [
                'pointsPerIDR' => (int) ($setting?->points_per_10000 ?? 1),
                'bonusMultiplier' => (int) ($setting?->weekend_bonus_multiplier ?? 2),
                'reviewBonus' => (int) ($setting?->review_bonus ?? 50),
                'firstOrderBonus' => (int) ($setting?->first_order_bonus ?? 100),
                'tiers' => $setting?->tiers ?? [],
                'updatedAt' => $setting?->updated_at?->toISOString(),
            ],
        ]);
    }
}
