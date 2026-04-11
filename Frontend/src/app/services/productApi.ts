import type { Product } from '../data/mockData';
import { getAuthToken } from './authApi';

interface ApiResponse<T> {
  data: T;
}

interface ApiErrorBody {
  message?: string;
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Token login tidak ditemukan.');
  }

  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };
}

async function parseApiError(response: Response, fallbackMessage: string): Promise<Error> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    return new Error(body.message || fallbackMessage);
  } catch {
    return new Error(fallbackMessage);
  }
}

type AdminProductPayload = {
  id: string;
  name: string;
  brand: string;
  category: Product['category'];
  price: number;
  originalPrice: number | null;
  rating: number;
  reviewCount: number;
  stock: number;
  image: string;
  badge: string | null;
  description: string;
  features: string[];
  specs: Record<string, string>;
  isNew: boolean;
  isBestSeller: boolean;
  stringable: boolean;
};

function mapProductToPayload(product: Product): AdminProductPayload {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    price: product.price,
    originalPrice: product.originalPrice ?? null,
    rating: product.rating,
    reviewCount: product.reviewCount,
    stock: product.stock,
    image: product.image,
    badge: product.badge ?? null,
    description: product.description,
    features: product.features,
    specs: product.specs,
    isNew: product.isNew ?? false,
    isBestSeller: product.isBestSeller ?? false,
    stringable: product.stringable ?? false,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch('/api/products');

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  const json = (await response.json()) as ApiResponse<Product[]>;
  return json.data;
}

export async function fetchProductById(id: string): Promise<Product> {
  const response = await fetch(`/api/products/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch product detail');
  }

  const json = (await response.json()) as ApiResponse<Product>;
  return json.data;
}

export async function createAdminProduct(product: Product): Promise<Product> {
  const response = await fetch('/api/admin/products', {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mapProductToPayload(product)),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Gagal menambahkan produk.');
  }

  const json = (await response.json()) as ApiResponse<Product>;
  return json.data;
}

export async function updateAdminProduct(id: string, product: Product): Promise<Product> {
  const response = await fetch(`/api/admin/products/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mapProductToPayload(product)),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Gagal memperbarui produk.');
  }

  const json = (await response.json()) as ApiResponse<Product>;
  return json.data;
}

export async function deleteAdminProduct(id: string): Promise<void> {
  const response = await fetch(`/api/admin/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Gagal menghapus produk.');
  }
}
