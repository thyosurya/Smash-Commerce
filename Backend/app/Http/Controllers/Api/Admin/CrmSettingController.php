<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\CrmSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CrmSettingController extends Controller
{
    public function show(): JsonResponse
    {
        $setting = $this->getOrCreateSetting();

        return response()->json([
            'data' => $this->formatSetting($setting),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pointsPerIDR' => ['required', 'integer', 'min:1', 'max:10'],
            'bonusMultiplier' => ['required', 'integer', 'min:1', 'max:5'],
            'reviewBonus' => ['required', 'integer', 'min:0', 'max:2000'],
            'firstOrderBonus' => ['required', 'integer', 'min:0', 'max:5000'],
            'tiers' => ['required', 'array', 'min:1'],
            'tiers.*.name' => ['required', 'string', 'max:50'],
            'tiers.*.minPoints' => ['required', 'integer', 'min:0'],
            'tiers.*.maxPoints' => ['nullable', 'integer', 'min:0'],
            'tiers.*.color' => ['required', 'string', 'max:20'],
            'tiers.*.icon' => ['nullable', 'string', 'max:10'],
            'tiers.*.discount' => ['required', 'integer', 'min:0', 'max:100'],
            'tiers.*.perks' => ['required', 'array'],
            'tiers.*.perks.*' => ['string', 'max:120'],
        ]);

        $setting = $this->getOrCreateSetting();

        $setting->fill([
            'points_per_10000' => $validated['pointsPerIDR'],
            'weekend_bonus_multiplier' => $validated['bonusMultiplier'],
            'review_bonus' => $validated['reviewBonus'],
            'first_order_bonus' => $validated['firstOrderBonus'],
            'tiers' => $validated['tiers'],
        ]);
        $setting->save();

        AuditLog::query()->create([
            'user_id' => $request->user()?->id,
            'type' => 'crm',
            'action' => 'Updated CRM settings',
            'detail' => 'Konfigurasi points, bonus, dan tier CRM diperbarui.',
            'meta' => [
                'pointsPerIDR' => $setting->points_per_10000,
                'bonusMultiplier' => $setting->weekend_bonus_multiplier,
                'reviewBonus' => $setting->review_bonus,
                'firstOrderBonus' => $setting->first_order_bonus,
                'tierCount' => count($setting->tiers ?? []),
            ],
        ]);

        return response()->json([
            'message' => 'CRM settings updated successfully.',
            'data' => $this->formatSetting($setting),
        ]);
    }

    private function getOrCreateSetting(): CrmSetting
    {
        return CrmSetting::query()->firstOrCreate(
            ['id' => 1],
            [
                'points_per_10000' => 1,
                'weekend_bonus_multiplier' => 2,
                'review_bonus' => 50,
                'first_order_bonus' => 100,
                'tiers' => [
                    [
                        'name' => 'Newbie',
                        'minPoints' => 0,
                        'maxPoints' => 999,
                        'color' => '#64748B',
                        'icon' => '🏸',
                        'discount' => 0,
                        'perks' => ['Free Shipping on 1st Order', 'Birthday Bonus'],
                    ],
                    [
                        'name' => 'Amateur',
                        'minPoints' => 1000,
                        'maxPoints' => 4999,
                        'color' => '#10B981',
                        'icon' => '⚡',
                        'discount' => 5,
                        'perks' => ['5% Discount', 'Priority Support', 'Early Access Sales'],
                    ],
                    [
                        'name' => 'Pro',
                        'minPoints' => 5000,
                        'maxPoints' => 11999,
                        'color' => '#2563EB',
                        'icon' => '🎯',
                        'discount' => 10,
                        'perks' => ['10% Discount', 'Free Shipping All Orders', 'VIP Events Access'],
                    ],
                    [
                        'name' => 'Champion',
                        'minPoints' => 12000,
                        'maxPoints' => null,
                        'color' => '#F59E0B',
                        'icon' => '🏆',
                        'discount' => 15,
                        'perks' => ['15% Discount', 'Free Stringing', 'Personal Coach Sessions', 'Exclusive Products'],
                    ],
                ],
            ],
        );
    }

    private function formatSetting(CrmSetting $setting): array
    {
        return [
            'pointsPerIDR' => $setting->points_per_10000,
            'bonusMultiplier' => $setting->weekend_bonus_multiplier,
            'reviewBonus' => $setting->review_bonus,
            'firstOrderBonus' => $setting->first_order_bonus,
            'tiers' => $setting->tiers,
            'updatedAt' => $setting->updated_at?->toISOString(),
        ];
    }
}
