import { getAuthToken } from './authApi';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface ApiErrorBody {
  message?: string;
}

export interface CrmTierSetting {
  name: string;
  minPoints: number;
  maxPoints: number | null;
  color: string;
  icon?: string;
  discount: number;
  perks: string[];
}

export interface AdminCrmSettings {
  pointsPerIDR: number;
  bonusMultiplier: number;
  reviewBonus: number;
  firstOrderBonus: number;
  tiers: CrmTierSetting[];
  updatedAt?: string;
}

async function parseApiError(response: Response, fallbackMessage: string): Promise<Error> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    return new Error(body.message || fallbackMessage);
  } catch {
    return new Error(fallbackMessage);
  }
}

function getHeaders(): HeadersInit {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Token login tidak ditemukan.');
  }

  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };
}

export async function fetchAdminCrmSettings(): Promise<AdminCrmSettings> {
  const response = await fetch('/api/admin/crm-settings', {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Gagal mengambil CRM settings.');
  }

  const json = (await response.json()) as ApiResponse<AdminCrmSettings>;
  return json.data;
}

export async function updateAdminCrmSettings(payload: AdminCrmSettings): Promise<AdminCrmSettings> {
  const response = await fetch('/api/admin/crm-settings', {
    method: 'PUT',
    headers: {
      ...getHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Gagal menyimpan CRM settings.');
  }

  const json = (await response.json()) as ApiResponse<AdminCrmSettings>;
  return json.data;
}
