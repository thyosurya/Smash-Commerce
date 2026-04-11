<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPointTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'delta_points',
        'balance_after',
        'source',
        'reference',
        'note',
        'meta',
    ];

    protected $casts = [
        'delta_points' => 'integer',
        'balance_after' => 'integer',
        'meta' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
