<?php

use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\AuditLogController as AdminAuditLogController;
use App\Http\Controllers\Api\Admin\CrmSettingController as AdminCrmSettingController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CrmController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PointController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
	Route::get('/auth/me', [AuthController::class, 'me']);
	Route::post('/auth/logout', [AuthController::class, 'logout']);
	Route::get('/crm/settings', [CrmController::class, 'show']);
	Route::get('/orders', [OrderController::class, 'index']);
	Route::post('/orders', [OrderController::class, 'store']);
	Route::post('/points/earn', [PointController::class, 'earn']);
	Route::get('/points/history', [PointController::class, 'history']);
});

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('/admin')->group(function () {
	Route::get('/dashboard', [AdminDashboardController::class, 'index']);
	Route::get('/audit-logs', [AdminAuditLogController::class, 'index']);
	Route::get('/crm-settings', [AdminCrmSettingController::class, 'show']);
	Route::put('/crm-settings', [AdminCrmSettingController::class, 'update']);
	Route::post('/products', [AdminProductController::class, 'store']);
	Route::put('/products/{id}', [AdminProductController::class, 'update']);
	Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);
});
