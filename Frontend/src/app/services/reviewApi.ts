import { getAuthToken } from './authApi';

const BASE = '/api';

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  if (!token) throw new Error('Token tidak ditemukan.');
  return { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' };
}

export interface Review {
  id: number;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

/** Ambil semua ulasan milik user yang login */
export async function fetchMyReviews(): Promise<Review[]> {
  const res = await fetch(`${BASE}/reviews/my`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Gagal memuat ulasan.');
  const json = await res.json() as { data: Review[] };
  return json.data;
}

/** Kirim ulasan baru */
export async function submitReview(payload: {
  orderId: string;
  productId: string;
  rating: number;
  comment?: string;
}): Promise<Review> {
  const res = await fetch(`${BASE}/reviews`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await res.json() as { message?: string; data?: Review };
  if (!res.ok) throw new Error(json.message ?? 'Gagal mengirim ulasan.');
  return json.data!;
}
