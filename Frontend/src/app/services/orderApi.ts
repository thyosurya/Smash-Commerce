import type { Order } from '../data/mockData';
import { getAuthToken } from './authApi';

export interface AdminOrder extends Order {
  shippingMethod: 'delivery' | 'pickup';
  adminNote?: string;
  user?: { id: number; name: string; email: string; phone: string };
}

export interface AdminOrderMeta {
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

export interface OrderStats {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  total: number;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface ApiErrorBody {
  message?: string;
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

export async function fetchMyOrders(): Promise<Order[]> {
  const response = await fetch('/api/orders', {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Gagal mengambil data order.');
  }

  const json = (await response.json()) as ApiResponse<Order[]>;
  return json.data;
}

export async function createOrderApi(payload: {
  items: Array<{
    productId: string;
    quantity: number;
    customization?: { stringType?: string; tension?: number };
  }>;
  address: string;
  paymentMethod: string;
  shippingMethod?: 'delivery' | 'pickup';
  phone?: string;
  shipping: number;
  discount: number;
}): Promise<Order> {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      ...getHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Gagal membuat order.');
  }

  const json = (await response.json()) as ApiResponse<Order>;
  return json.data;
}

/* ─── Admin APIs ─────────────────────────────────────────────────── */

export async function fetchAdminOrders(params?: {
  status?: string;
  shipping_method?: string;
  search?: string;
  page?: number;
}): Promise<{ data: AdminOrder[]; meta: AdminOrderMeta }> {
  const url = new URL('/api/admin/orders', window.location.origin);
  if (params?.status) url.searchParams.set('status', params.status);
  if (params?.shipping_method) url.searchParams.set('shipping_method', params.shipping_method);
  if (params?.search) url.searchParams.set('search', params.search);
  if (params?.page) url.searchParams.set('page', String(params.page));

  const response = await fetch(url.toString(), { headers: getHeaders() });
  if (!response.ok) throw await parseApiError(response, 'Gagal memuat daftar order.');
  return response.json() as Promise<{ data: AdminOrder[]; meta: AdminOrderMeta }>;
}

export async function fetchOrderStats(): Promise<OrderStats> {
  const response = await fetch('/api/admin/orders/stats', { headers: getHeaders() });
  if (!response.ok) throw await parseApiError(response, 'Gagal memuat statistik order.');
  const json = (await response.json()) as { data: OrderStats };
  return json.data;
}

export async function updateOrderStatus(
  id: string,
  payload: { status: string; trackingNumber?: string; adminNote?: string }
): Promise<AdminOrder> {
  const response = await fetch(`/api/admin/orders/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: { ...getHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await parseApiError(response, 'Gagal memperbarui status order.');
  const json = (await response.json()) as { data: AdminOrder };
  return json.data;
}
