<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;

class AuditLogController extends Controller
{
    public function index(): JsonResponse
    {
        $logs = AuditLog::query()
            ->with(['user:id,name'])
            ->latest()
            ->limit(200)
            ->get();

        return response()->json([
            'data' => $logs->map(fn (AuditLog $log) => [
                'id' => $log->id,
                'type' => $log->type,
                'action' => $log->action,
                'detail' => $log->detail,
                'admin' => $log->user?->name ?? 'System',
                'timestamp' => $log->created_at?->toISOString(),
                'meta' => $log->meta,
            ]),
        ]);
    }
}
