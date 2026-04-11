<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CrmSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'points_per_10000',
        'weekend_bonus_multiplier',
        'review_bonus',
        'first_order_bonus',
        'tiers',
    ];

    protected $casts = [
        'points_per_10000' => 'integer',
        'weekend_bonus_multiplier' => 'integer',
        'review_bonus' => 'integer',
        'first_order_bonus' => 'integer',
        'tiers' => 'array',
    ];
}
