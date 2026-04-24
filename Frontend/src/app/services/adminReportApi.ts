import { getAuthToken } from './authApi';

interface ApiErrorBody {
  message?: string;
}

interface ApiResponse<T> {
  data: T;
}

export type AdminReportPeriod = '7d' | '30d' | '12m' | 'all';

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

export async function fetchAdminReport(period: AdminReportPeriod): Promise<AdminReportData> {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Token login tidak ditemukan.');
  }

  const response = await fetch(`/api/admin/reports?period=${period}`, {
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
