import { getAuthToken } from './authApi';

interface ApiResponse<T> {
  data: T;
}

export interface CrmTier {
  name: string;
  minPoints: number;
  maxPoints: number | null;
  color: string;
  icon?: string;
  discount: number;
  perks: string[];
}

export interface UserCrmSettings {
  pointsPerIDR: number;
  bonusMultiplier: number;
  reviewBonus: number;
  firstOrderBonus: number;
  tiers: CrmTier[];
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

export async function fetchUserCrmSettings(): Promise<UserCrmSettings> {
  const response = await fetch('/api/crm/settings', {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Gagal mengambil CRM settings.');
  }

  const json = (await response.json()) as ApiResponse<UserCrmSettings>;
  return json.data;
}
