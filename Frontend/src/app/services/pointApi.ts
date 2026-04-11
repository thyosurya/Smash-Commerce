import { getAuthToken } from './authApi';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface ApiErrorBody {
  message?: string;
}

export interface EarnPointsResponse {
  earnedPoints: number;
  currentPoints: number;
}

export interface PointHistoryItem {
  id: number;
  deltaPoints: number;
  balanceAfter: number;
  source: string;
  reference?: string | null;
  note?: string | null;
  meta?: Record<string, unknown>;
  createdAt?: string;
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

export async function earnPointsApi(payload: {
  totalAmount: number;
  source?: string;
  reference?: string;
  note?: string;
  meta?: Record<string, unknown>;
}): Promise<EarnPointsResponse> {
  const response = await fetch('/api/points/earn', {
    method: 'POST',
    headers: {
      ...getHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Gagal menambahkan poin user.');
  }

  const json = (await response.json()) as ApiResponse<EarnPointsResponse>;
  return json.data;
}

export async function fetchPointHistoryApi(): Promise<PointHistoryItem[]> {
  const response = await fetch('/api/points/history', {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Gagal mengambil histori poin.');
  }

  const json = (await response.json()) as ApiResponse<PointHistoryItem[]>;
  return json.data;
}
