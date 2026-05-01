<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // 'delivery' = dikirim kurir, 'pickup' = ambil di toko
            $table->string('shipping_method', 20)->default('delivery')->after('payment_method');
            $table->string('admin_note', 500)->nullable()->after('shipping_method');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['shipping_method', 'admin_note']);
        });
    }
};
