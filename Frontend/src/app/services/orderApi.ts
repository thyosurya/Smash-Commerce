import type { Order } from '../data/mockData';
import { getAuthToken } from './authApi';

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
