<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'brand',
        'category',
        'price',
        'original_price',
        'rating',
        'review_count',
        'stock',
        'image',
        'badge',
        'description',
        'features',
        'specs',
        'is_new',
        'is_best_seller',
        'stringable',
    ];

    protected $casts = [
        'price' => 'integer',
        'original_price' => 'integer',
        'rating' => 'float',
        'review_count' => 'integer',
        'stock' => 'integer',
        'features' => 'array',
        'specs' => 'array',
        'is_new' => 'boolean',
        'is_best_seller' => 'boolean',
        'stringable' => 'boolean',
    ];
}
