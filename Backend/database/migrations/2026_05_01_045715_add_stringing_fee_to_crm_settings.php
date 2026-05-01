<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('crm_settings', function (Blueprint $table) {
            $table->unsignedInteger('stringing_service_fee')->default(30000)->after('first_order_bonus');
        });
    }

    public function down(): void
    {
        Schema::table('crm_settings', function (Blueprint $table) {
            $table->dropColumn('stringing_service_fee');
        });
    }
};
