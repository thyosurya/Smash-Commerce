<?php

use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\AuditLogController as AdminAuditLogController;
use App\Http\Controllers\Api\Admin\CrmSettingController as AdminCrmSettingController;
use App\Http\Controllers\Api\Admin\StringingController as AdminStringingController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CrmController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PointController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
	Route::get('/auth/me', [AuthController::class, 'me']);
	Route::patch('/auth/profile', [AuthController::class, 'updateProfile']);
	Route::post('/auth/logout', [AuthController::class, 'logout']);
	Route::get('/crm/settings', [CrmController::class, 'show']);
	Route::get('/orders', [OrderController::class, 'index']);
	Route::post('/orders', [OrderController::class, 'store']);
	Route::post('/points/earn', [PointController::class, 'earn']);
	Route::get('/points/history', [PointController::class, 'history']);
	// Reviews
	Route::get('/reviews/my', [ReviewController::class, 'index']);
	Route::post('/reviews', [ReviewController::class, 'store']);
});

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('/admin')->group(function () {
	Route::get('/dashboard', [AdminDashboardController::class, 'index']);
	Route::get('/reports', [AdminReportController::class, 'index']);
	Route::get('/audit-logs', [AdminAuditLogController::class, 'index']);
	Route::get('/crm-settings', [AdminCrmSettingController::class, 'show']);
	Route::put('/crm-settings', [AdminCrmSettingController::class, 'update']);
	Route::post('/products', [AdminProductController::class, 'store']);
	Route::put('/products/{id}', [AdminProductController::class, 'update']);
	Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);
	// Stringing service management
	Route::get('/stringing-services', [AdminStringingController::class, 'index']);
	Route::post('/stringing-services', [AdminStringingController::class, 'store']);
	Route::put('/stringing-services/fee', [AdminStringingController::class, 'updateFee']);
	Route::put('/stringing-services/{id}', [AdminStringingController::class, 'update']);
	Route::delete('/stringing-services/{id}', [AdminStringingController::class, 'destroy']);
	// Order management
	Route::get('/orders', [AdminOrderController::class, 'index']);
	Route::get('/orders/stats', [AdminOrderController::class, 'stats']);
	Route::patch('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
});
