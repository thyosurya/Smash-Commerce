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
        Schema::create('crm_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('points_per_10000')->default(1);
            $table->unsignedInteger('weekend_bonus_multiplier')->default(2);
            $table->unsignedInteger('review_bonus')->default(50);
            $table->unsignedInteger('first_order_bonus')->default(100);
            $table->json('tiers');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_settings');
    }
};
