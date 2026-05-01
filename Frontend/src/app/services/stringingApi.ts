import { getAuthToken } from './authApi';

const API_BASE = '/api/admin/stringing-services';

export interface StringingService {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  badge: string | null;
}

export interface StringingListResponse {
  data: StringingService[];
  serviceFee: number;
}

interface ApiError { message?: string; }

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  if (!token) throw new Error('Token tidak ditemukan.');
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };
}

async function parseError(res: Response, fallback: string): Promise<Error> {
  try {
    const body = (await res.json()) as ApiError;
    return new Error(body.message ?? fallback);
  } catch {
    return new Error(fallback);
  }
}

/* ─── Fetch list + fee ──────────────────────────────────────────── */
export async function fetchStringingServices(): Promise<StringingListResponse> {
  const res = await fetch(API_BASE, { headers: authHeaders() });
  if (!res.ok) throw await parseError(res, 'Gagal memuat layanan stringing.');
  return res.json() as Promise<StringingListResponse>;
}

/* ─── Update service fee ─────────────────────────────────────────── */
export async function updateStringingFee(serviceFee: number): Promise<number> {
  const res = await fetch(`${API_BASE}/fee`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ serviceFee }),
  });
  if (!res.ok) throw await parseError(res, 'Gagal memperbarui biaya jasa.');
  const json = (await res.json()) as { serviceFee: number };
  return json.serviceFee;
}

/* ─── Create ─────────────────────────────────────────────────────── */
export async function createStringingService(
  payload: Omit<StringingService, 'id' | 'rating' | 'reviewCount' | 'badge'>
): Promise<StringingService> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await parseError(res, 'Gagal menambahkan layanan stringing.');
  const json = (await res.json()) as { data: StringingService };
  return json.data;
}

/* ─── Update ─────────────────────────────────────────────────────── */
export async function updateStringingService(
  id: string,
  payload: Partial<Omit<StringingService, 'id' | 'rating' | 'reviewCount' | 'badge'>>
): Promise<StringingService> {
  const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await parseError(res, 'Gagal memperbarui layanan stringing.');
  const json = (await res.json()) as { data: StringingService };
  return json.data;
}

/* ─── Delete ─────────────────────────────────────────────────────── */
export async function deleteStringingService(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw await parseError(res, 'Gagal menghapus layanan stringing.');
}
