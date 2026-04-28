import { getAuthToken } from './authApi';

interface ApiErrorBody {
  message?: string;
}

interface ApiResponse<T> {
  data: T;
}

export type AdminReportPeriod = '7d' | '30d' | '12m' | 'all';

export interface AdminReportFilters {
  status?: string | null;
  category?: string | null;
  paymentMethod?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface AdminReportSummary {
  totalSales: number;
  totalIncome: number;
  totalTransactions: number;
  totalDiscount: number;
  totalShipping: number;
  totalItemsSold: number;
  averageTransaction: number;
}

export interface AdminReportBreakdownPoint {
  label: string;
  sales: number;
  income: number;
  transactions: number;
  itemsSold: number;
}

export interface AdminTopProductReportItem {
  productId: string;
  name: string;
  brand: string;
  category: string;
  quantitySold: number;
  salesAmount: number;
  transactionCount: number;
  contribution: number;
}

export interface AdminTransactionReportItem {
  id: string;
  date: string;
  customerName: string;
  customerEmail: string;
  status: string;
  paymentMethod: string;
  itemCount: number;
  itemSummary: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  trackingNumber: string;
}

export interface AdminSimpleBreakdownItem {
  label: string;
  count: number;
  amount: number;
}

export interface AdminReportData {
  period: AdminReportPeriod;
  filters: AdminReportFilters;
  summary: AdminReportSummary;
  salesBreakdown: AdminReportBreakdownPoint[];
  topProducts: AdminTopProductReportItem[];
  transactions: AdminTransactionReportItem[];
  paymentMethods: AdminSimpleBreakdownItem[];
  statusBreakdown: AdminSimpleBreakdownItem[];
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

export async function fetchAdminReport(period: AdminReportPeriod, filters?: AdminReportFilters): Promise<AdminReportData> {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Token login tidak ditemukan.');
  }

  const params = new URLSearchParams({ period });
  
  if (filters?.status) {
    params.append('status', filters.status);
  }
  if (filters?.category) {
    params.append('category', filters.category);
  }
  if (filters?.paymentMethod) {
    params.append('paymentMethod', filters.paymentMethod);
  }
  if (filters?.startDate) {
    params.append('startDate', filters.startDate);
  }
  if (filters?.endDate) {
    params.append('endDate', filters.endDate);
  }

  const response = await fetch(`/api/admin/reports?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Gagal mengambil data laporan admin.');
  }

  const json = (await response.json()) as ApiResponse<AdminReportData>;
  return json.data;
}
