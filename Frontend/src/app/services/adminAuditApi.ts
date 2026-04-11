import { getAuthToken } from './authApi';

interface ApiResponse<T> {
  data: T;
}

interface ApiErrorBody {
  message?: string;
}

export interface AdminAuditLogItem {
  id: number;
  type: 'price' | 'stock' | 'product' | 'crm' | 'order' | string;
  action: string;
  detail: string;
  admin: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

async function parseApiError(response: Response, fallbackMessage: string): Promise<Error> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    return new Error(body.message || fallbackMessage);
  } catch {
    return new Error(fallbackMessage);
  }
}

export async function fetchAdminAuditLogs(): Promise<AdminAuditLogItem[]> {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Token login tidak ditemukan.');
  }

  const response = await fetch('/api/admin/audit-logs', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Gagal mengambil data audit log.');
  }

  const json = (await response.json()) as ApiResponse<AdminAuditLogItem[]>;
  return json.data;
}
