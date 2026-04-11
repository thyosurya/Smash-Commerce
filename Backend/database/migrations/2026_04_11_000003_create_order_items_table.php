<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->string('order_id', 30);
            $table->string('product_id', 50);
            $table->string('product_name');
            $table->string('product_brand')->nullable();
            $table->string('product_category')->nullable();
            $table->text('product_image')->nullable();
            $table->unsignedInteger('price');
            $table->unsignedInteger('quantity');
            $table->json('customization')->nullable();
            $table->timestamps();

            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
            $table->index(['order_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
