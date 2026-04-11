import { getAuthToken } from './authApi';

interface ApiErrorBody {
  message?: string;
}

interface ApiResponse<T> {
  data: T;
}

export interface DashboardSummary {
  inventoryValue: number;
  totalProducts: number;
  activeUsers: number;
  lowStockProducts: number;
  totalUserPoints: number;
  pointsLast7Days: number;
}

export interface DashboardSeriesPoint {
  day?: string;
  month?: string;
  sales: number;
  orders: number;
}

export interface DashboardProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  rating: number;
  reviewCount: number;
  stock: number;
  image: string;
  badge?: string | null;
  description: string;
  features: string[];
  specs: Record<string, string>;
  isNew?: boolean;
  isBestSeller?: boolean;
  stringable?: boolean;
}

export interface DashboardTopProduct {
  product: DashboardProduct;
  views: number;
  cartAdds: number;
  purchases: number;
}

export interface DashboardPointFlow {
  day: string;
  netPoints: number;
}

export interface DashboardTierDistribution {
  tier: string;
  count: number;
  color: string;
}

export interface DashboardTopPointUser {
  id: number;
  name: string;
  points: number;
}

export interface AdminDashboardData {
  summary: DashboardSummary;
  dailySales: DashboardSeriesPoint[];
  monthlySales: DashboardSeriesPoint[];
  dailyPointFlow: DashboardPointFlow[];
  userTierDistribution: DashboardTierDistribution[];
  topPointUsers: DashboardTopPointUser[];
  topProducts: DashboardTopProduct[];
  generatedAt: string;
}

async function parseApiError(response: Response, fallbackMessage: string): Promise<Error> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    return new Error(body.message || fallbackMessage);
  } catch {
    return new Error(fallbackMessage);
  }
}

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Token login tidak ditemukan.');
  }

  const response = await fetch('/api/admin/dashboard', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Gagal mengambil data dashboard admin.');
  }

  const json = (await response.json()) as ApiResponse<AdminDashboardData>;
  return json.data;
}