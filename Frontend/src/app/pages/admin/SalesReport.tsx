import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowDownToLine, BadgeDollarSign, FileSpreadsheet, Package, ReceiptText, Wallet, X } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  fetchAdminReport,
  type AdminReportData,
  type AdminReportFilters,
  type AdminReportPeriod,
  type AdminReportBreakdownPoint,
  type AdminTransactionReportItem,
  type AdminTopProductReportItem,
} from '../../services/adminReportApi';

const PERIOD_OPTIONS: Array<{ value: AdminReportPeriod; label: string }> = [
  { value: '7d', label: '7 Hari' },
  { value: '30d', label: '30 Hari' },
  { value: '12m', label: '12 Bulan' },
  { value: 'all', label: 'Semua' },
];

const INITIAL_DATA: AdminReportData = {
  period: '30d',
  filters: {
    status: null,
    category: null,
    paymentMethod: null,
    startDate: null,
    endDate: null,
  },
  summary: {
    totalSales: 0,
    totalIncome: 0,
    totalTransactions: 0,
    totalDiscount: 0,
    totalShipping: 0,
    totalItemsSold: 0,
    averageTransaction: 0,
  },
  salesBreakdown: [],
  topProducts: [],
  transactions: [],
  paymentMethods: [],
  statusBreakdown: [],
  generatedAt: new Date().toISOString(),
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const sanitizeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

function buildWorkbookXml(report: AdminReportData): string {
  const worksheet = (name: string, rows: string[][]): string => `
    <Worksheet ss:Name="${sanitizeHtml(name)}">
      <Table>
        ${rows
          .map(
            (row) => `<Row>${row.map((cell) => `<Cell><Data ss:Type="String">${sanitizeHtml(cell)}</Data></Cell>`).join('')}</Row>`,
          )
          .join('')}
      </Table>
    </Worksheet>
  `;

  const summaryRows = [
    ['Metric', 'Nilai'],
    ['Periode', report.period],
    ['Total Penjualan', formatCurrency(report.summary.totalSales)],
    ['Total Pemasukan', formatCurrency(report.summary.totalIncome)],
    ['Total Transaksi', report.summary.totalTransactions.toString()],
    ['Total Item Terjual', report.summary.totalItemsSold.toString()],
    ['Rata-rata Transaksi', formatCurrency(report.summary.averageTransaction)],
    ['Total Diskon', formatCurrency(report.summary.totalDiscount)],
    ['Total Ongkir', formatCurrency(report.summary.totalShipping)],
    ['Dibuat Pada', formatDateTime(report.generatedAt)],
  ];

  const productRows = [
    ['Produk', 'Brand', 'Kategori', 'Qty Terjual', 'Nilai Penjualan', 'Jumlah Transaksi', 'Kontribusi'],
    ...report.topProducts.map((item) => [
      item.name,
      item.brand,
      item.category,
      item.quantitySold.toString(),
      formatCurrency(item.salesAmount),
      item.transactionCount.toString(),
      `${item.contribution.toFixed(2)}%`,
    ]),
  ];

  const transactionRows = [
    ['ID', 'Tanggal', 'Pelanggan', 'Email', 'Status', 'Pembayaran', 'Item', 'Subtotal', 'Ongkir', 'Diskon', 'Total'],
    ...report.transactions.map((item) => [
      item.id,
      formatDateTime(item.date),
      item.customerName,
      item.customerEmail,
      item.status,
      item.paymentMethod,
      item.itemSummary,
      formatCurrency(item.subtotal),
      formatCurrency(item.shipping),
      formatCurrency(item.discount),
      formatCurrency(item.total),
    ]),
  ];

  const salesRows = [
    ['Periode', 'Penjualan', 'Pemasukan', 'Transaksi', 'Item Terjual'],
    ...report.salesBreakdown.map((item) => [
      item.label,
      formatCurrency(item.sales),
      formatCurrency(item.income),
      item.transactions.toString(),
      item.itemsSold.toString(),
    ]),
  ];

  return `<?xml version="1.0"?>
  <?mso-application progid="Excel.Sheet"?>
  <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
   xmlns:o="urn:schemas-microsoft-com:office:office"
   xmlns:x="urn:schemas-microsoft-com:office:excel"
   xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
   xmlns:html="http://www.w3.org/TR/REC-html40">
    ${worksheet('Ringkasan', summaryRows)}
    ${worksheet('Produk Terlaris', productRows)}
    ${worksheet('Transaksi', transactionRows)}
    ${worksheet('Penjualan', salesRows)}
  </Workbook>`;
}

function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function exportReportToExcel(report: AdminReportData) {
  downloadFile(buildWorkbookXml(report), `laporan-admin-${report.period}.xls`, 'application/vnd.ms-excel');
}

function openPdfDocument(report: AdminReportData) {
  const popup = window.open('', '_blank', 'width=1200,height=900');

  if (!popup) {
    throw new Error('Popup diblokir browser. Izinkan popup untuk export PDF.');
  }

  const summaryCards = [
    ['Total Penjualan', formatCurrency(report.summary.totalSales)],
    ['Total Pemasukan', formatCurrency(report.summary.totalIncome)],
    ['Total Transaksi', report.summary.totalTransactions.toLocaleString('id-ID')],
    ['Item Terjual', report.summary.totalItemsSold.toLocaleString('id-ID')],
    ['Rata-rata Transaksi', formatCurrency(report.summary.averageTransaction)],
    ['Total Diskon', formatCurrency(report.summary.totalDiscount)],
  ];

  popup.document.write(`
    <html>
      <head>
        <title>Laporan Admin</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 32px; color: #0f172a; }
          h1, h2 { margin: 0 0 12px; }
          p { margin: 0 0 8px; color: #475569; }
          .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 24px 0; }
          .card { border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px; }
          .card span { display: block; font-size: 12px; color: #64748b; margin-bottom: 6px; }
          .card strong { font-size: 18px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 12px; vertical-align: top; }
          th { background: #eff6ff; }
          .section { margin-top: 28px; }
        </style>
      </head>
      <body>
        <h1>Laporan Admin Smash Commerce</h1>
        <p>Periode: ${sanitizeHtml(report.period)}</p>
        <p>Dibuat: ${sanitizeHtml(formatDateTime(report.generatedAt))}</p>

        <div class="grid">
          ${summaryCards
            .map(
              ([label, value]) => `
                <div class="card">
                  <span>${sanitizeHtml(label)}</span>
                  <strong>${sanitizeHtml(value)}</strong>
                </div>`,
            )
            .join('')}
        </div>

        <div class="section">
          <h2>Laporan Penjualan</h2>
          <table>
            <thead>
              <tr>
                <th>Periode</th>
                <th>Penjualan</th>
                <th>Pemasukan</th>
                <th>Transaksi</th>
                <th>Item Terjual</th>
              </tr>
            </thead>
            <tbody>
              ${report.salesBreakdown
                .map(
                  (item) => `
                    <tr>
                      <td>${sanitizeHtml(item.label)}</td>
                      <td>${sanitizeHtml(formatCurrency(item.sales))}</td>
                      <td>${sanitizeHtml(formatCurrency(item.income))}</td>
                      <td>${sanitizeHtml(item.transactions.toLocaleString('id-ID'))}</td>
                      <td>${sanitizeHtml(item.itemsSold.toLocaleString('id-ID'))}</td>
                    </tr>`,
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Produk Terlaris</h2>
          <table>
            <thead>
              <tr>
                <th>Produk</th>
                <th>Kategori</th>
                <th>Qty</th>
                <th>Nilai Penjualan</th>
                <th>Kontribusi</th>
              </tr>
            </thead>
            <tbody>
              ${report.topProducts
                .map(
                  (item) => `
                    <tr>
                      <td>${sanitizeHtml(item.name)}<br /><small>${sanitizeHtml(item.brand)}</small></td>
                      <td>${sanitizeHtml(item.category)}</td>
                      <td>${sanitizeHtml(item.quantitySold.toLocaleString('id-ID'))}</td>
                      <td>${sanitizeHtml(formatCurrency(item.salesAmount))}</td>
                      <td>${sanitizeHtml(item.contribution.toFixed(2))}%</td>
                    </tr>`,
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Laporan Transaksi</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tanggal</th>
                <th>Pelanggan</th>
                <th>Item</th>
                <th>Status</th>
                <th>Metode</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${report.transactions
                .slice(0, 25)
                .map(
                  (item) => `
                    <tr>
                      <td>${sanitizeHtml(item.id)}</td>
                      <td>${sanitizeHtml(formatDateTime(item.date))}</td>
                      <td>${sanitizeHtml(item.customerName)}<br /><small>${sanitizeHtml(item.customerEmail)}</small></td>
                      <td>${sanitizeHtml(item.itemSummary)}</td>
                      <td>${sanitizeHtml(item.status)}</td>
                      <td>${sanitizeHtml(item.paymentMethod)}</td>
                      <td>${sanitizeHtml(formatCurrency(item.total))}</td>
                    </tr>`,
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </body>
    </html>
  `);

  popup.document.close();
  popup.focus();
  popup.print();
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border bg-white px-3 py-2 text-xs shadow-lg" style={{ borderColor: '#E2E8F0' }}>
      <p className="mb-1 font-semibold" style={{ color: '#0F172A' }}>{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name === 'sales' || entry.name === 'income'
            ? `${entry.name === 'sales' ? 'Penjualan' : 'Pemasukan'}: ${formatCurrency(entry.value)}`
            : `Transaksi: ${entry.value}`}
        </p>
      ))}
    </div>
  );
};

function BreakdownTable({ rows }: { rows: AdminReportBreakdownPoint[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="text-left text-xs">
            <th className="px-4 py-3 font-semibold" style={{ color: '#475569' }}>Periode</th>
            <th className="px-4 py-3 font-semibold" style={{ color: '#475569' }}>Penjualan</th>
            <th className="px-4 py-3 font-semibold" style={{ color: '#475569' }}>Pemasukan</th>
            <th className="px-4 py-3 font-semibold" style={{ color: '#475569' }}>Transaksi</th>
            <th className="px-4 py-3 font-semibold" style={{ color: '#475569' }}>Item</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t" style={{ borderColor: '#F1F5F9' }}>
              <td className="px-4 py-3 text-sm font-medium" style={{ color: '#0F172A' }}>{row.label}</td>
              <td className="px-4 py-3 text-sm" style={{ color: '#0F172A' }}>{formatCurrency(row.sales)}</td>
              <td className="px-4 py-3 text-sm" style={{ color: '#0F172A' }}>{formatCurrency(row.income)}</td>
              <td className="px-4 py-3 text-sm" style={{ color: '#0F172A' }}>{row.transactions.toLocaleString('id-ID')}</td>
              <td className="px-4 py-3 text-sm" style={{ color: '#0F172A' }}>{row.itemsSold.toLocaleString('id-ID')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductTable({ rows }: { rows: AdminTopProductReportItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px]">
        <thead>
          <tr className="text-left text-xs">
            <th className="px-4 py-3 font-semibold" style={{ color: '#475569' }}>Produk</th>
            <th className="px-4 py-3 font-semibold" style={{ color: '#475569' }}>Kategori</th>
            <th className="px-4 py-3 font-semibold" style={{ color: '#475569' }}>Qty Terjual</th>
            <th className="px-4 py-3 font-semibold" style={{ color: '#475569' }}>Nilai Penjualan</th>
            <th className="px-4 py-3 font-semibold" style={{ color: '#475569' }}>Transaksi</th>
            <th className="px-4 py-3 font-semibold" style={{ color: '#475569' }}>Kontribusi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.productId} className="border-t" style={{ borderColor: '#F1F5F9' }}>
              <td className="px-4 py-3">
                <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>{row.name}</div>
                <div className="text-xs" style={{ color: '#94A3B8' }}>{row.brand}</div>
              </td>
              <td className="px-4 py-3 text-sm" style={{ color: '#0F172A' }}>{row.category}</td>
              <td className="px-4 py-3 text-sm" style={{ color: '#0F172A' }}>{row.quantitySold.toLocaleString('id-ID')}</td>
              <td className="px-4 py-3 text-sm" style={{ color: '#0F172A' }}>{formatCurrency(row.salesAmount)}</td>
              <td className="px-4 py-3 text-sm" style={{ color: '#0F172A' }}>{row.transactionCount.toLocaleString('id-ID')}</td>
              <td className="px-4 py-3 text-sm font-semibold" style={{ color: '#1D4ED8' }}>{row.contribution.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TransactionTable({ rows }: { rows: AdminTransactionReportItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1080px]">
        <thead>
          <tr className="text-left text-xs">
            <th className="px-4 py-3 font-semibold" style={{ color: '#475569' }}>Transaksi</th>
            <th className="px-4 py-3 font-semibold" style={{ color: '#475569' }}>Pelanggan</th>
            <th className="px-4 py-3 font-semibold" style={{ color: '#475569' }}>Item</th>
            <th className="px-4 py-3 font-semibold" style={{ color: '#475569' }}>Pembayaran</th>
            <th className="px-4 py-3 font-semibold" style={{ color: '#475569' }}>Status</th>
            <th className="px-4 py-3 font-semibold" style={{ color: '#475569' }}>Total</th>
            <th className="px-4 py-3 font-semibold" style={{ color: '#475569' }}>Tracking</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t" style={{ borderColor: '#F1F5F9' }}>
              <td className="px-4 py-3">
                <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>{row.id}</div>
                <div className="text-xs" style={{ color: '#94A3B8' }}>{formatDateTime(row.date)}</div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm font-medium" style={{ color: '#0F172A' }}>{row.customerName}</div>
                <div className="text-xs" style={{ color: '#94A3B8' }}>{row.customerEmail}</div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm" style={{ color: '#0F172A' }}>{row.itemSummary}</div>
                <div className="text-xs" style={{ color: '#94A3B8' }}>{row.itemCount.toLocaleString('id-ID')} item</div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm" style={{ color: '#0F172A' }}>{row.paymentMethod}</div>
                <div className="text-xs" style={{ color: '#94A3B8' }}>
                  Subtotal {formatCurrency(row.subtotal)} | Diskon {formatCurrency(row.discount)}
                </div>
              </td>
              <td className="px-4 py-3">
                <span
                  className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize"
                  style={{
                    background: row.status === 'processing' ? '#DBEAFE' : '#DCFCE7',
                    color: row.status === 'processing' ? '#1D4ED8' : '#15803D',
                  }}
                >
                  {row.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm font-semibold" style={{ color: '#0F172A' }}>{formatCurrency(row.total)}</td>
              <td className="px-4 py-3 text-sm" style={{ color: '#475569' }}>{row.trackingNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SalesReport() {
  const [period, setPeriod] = useState<AdminReportPeriod>('30d');
  const [filters, setFilters] = useState<AdminReportFilters>({
    status: null,
    category: null,
    paymentMethod: null,
    startDate: null,
    endDate: null,
  });
  const [report, setReport] = useState<AdminReportData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadReport = async () => {
      try {
        setLoading(true);
        const data = await fetchAdminReport(period, filters);
        if (isMounted) {
          setReport(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Gagal mengambil data laporan.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadReport();

    return () => {
      isMounted = false;
    };
  }, [period, filters]);

  const generatedAt = useMemo(() => formatDateTime(report.generatedAt), [report.generatedAt]);

  const latestComparison = useMemo(() => {
    if (report.salesBreakdown.length < 2) return 0;
    const current = report.salesBreakdown[report.salesBreakdown.length - 1]?.income ?? 0;
    const previous = report.salesBreakdown[report.salesBreakdown.length - 2]?.income ?? 0;
    if (previous <= 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }, [report.salesBreakdown]);

  return (
    <div className="min-h-screen space-y-5 p-5" style={{ background: '#F1F5F9' }}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#0F172A' }}>Laporan</h1>
          <p className="text-sm" style={{ color: '#94A3B8' }}>
            Laporan penjualan, produk terlaris, transaksi, pemasukan, dan export admin. Diperbarui {generatedAt}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <div className="flex flex-wrap gap-2">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setPeriod(option.value)}
                className="rounded-full px-4 py-2 text-xs font-semibold transition-all"
                style={{
                  background: period === option.value ? '#1D4ED8' : '#FFFFFF',
                  color: period === option.value ? '#FFFFFF' : '#475569',
                  border: period === option.value ? '1px solid #1D4ED8' : '1px solid #E2E8F0',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => exportReportToExcel(report)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
              style={{ background: '#FFFFFF', color: '#0F172A', border: '1px solid #E2E8F0' }}
            >
              <FileSpreadsheet size={16} />
              Export Excel
            </button>
            <button
              onClick={() => openPdfDocument(report)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
              style={{ background: '#0F172A', color: '#FFFFFF', border: '1px solid #0F172A' }}
            >
              <ArrowDownToLine size={16} />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
        <h3 className="mb-3 text-sm font-semibold" style={{ color: '#0F172A' }}>Filter Laporan</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs font-semibold" style={{ color: '#475569' }}>Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value || null })}
              className="w-full rounded-lg border px-3 py-2 text-xs"
              style={{ borderColor: '#E2E8F0', color: '#0F172A' }}
            >
              <option value="">Semua Status</option>
              {report.statusBreakdown.map((item) => (
                <option key={item.label} value={item.label}>{item.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold" style={{ color: '#475569' }}>Kategori</label>
            <input
              type="text"
              placeholder="Cari kategori..."
              value={filters.category || ''}
              onChange={(e) => setFilters({ ...filters, category: e.target.value || null })}
              className="w-full rounded-lg border px-3 py-2 text-xs"
              style={{ borderColor: '#E2E8F0', color: '#0F172A' }}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold" style={{ color: '#475569' }}>Metode Pembayaran</label>
            <select
              value={filters.paymentMethod || ''}
              onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value || null })}
              className="w-full rounded-lg border px-3 py-2 text-xs"
              style={{ borderColor: '#E2E8F0', color: '#0F172A' }}
            >
              <option value="">Semua Metode</option>
              {report.paymentMethods.map((item) => (
                <option key={item.label} value={item.label}>{item.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold" style={{ color: '#475569' }}>Tanggal Mulai</label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value || null })}
              className="w-full rounded-lg border px-3 py-2 text-xs"
              style={{ borderColor: '#E2E8F0', color: '#0F172A' }}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold" style={{ color: '#475569' }}>Tanggal Akhir</label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value || null })}
              className="w-full rounded-lg border px-3 py-2 text-xs"
              style={{ borderColor: '#E2E8F0', color: '#0F172A' }}
            />
          </div>
        </div>

        {(filters.status || filters.category || filters.paymentMethod || filters.startDate || filters.endDate) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.status && (
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                Status: {filters.status}
                <button onClick={() => setFilters({ ...filters, status: null })} className="ml-1">
                  <X size={12} />
                </button>
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                Kategori: {filters.category}
                <button onClick={() => setFilters({ ...filters, category: null })} className="ml-1">
                  <X size={12} />
                </button>
              </span>
            )}
            {filters.paymentMethod && (
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                Metode: {filters.paymentMethod}
                <button onClick={() => setFilters({ ...filters, paymentMethod: null })} className="ml-1">
                  <X size={12} />
                </button>
              </span>
            )}
            {filters.startDate && (
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                Dari: {filters.startDate}
                <button onClick={() => setFilters({ ...filters, startDate: null })} className="ml-1">
                  <X size={12} />
                </button>
              </span>
            )}
            {filters.endDate && (
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                Hingga: {filters.endDate}
                <button onClick={() => setFilters({ ...filters, endDate: null })} className="ml-1">
                  <X size={12} />
                </button>
              </span>
            )}
            <button
              onClick={() => setFilters({ status: null, category: null, paymentMethod: null, startDate: null, endDate: null })}
              className="text-xs font-semibold"
              style={{ color: '#0F172A' }}
            >
              Reset Semua
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border px-4 py-3 text-sm" style={{ background: '#FEF2F2', color: '#B91C1C', borderColor: '#FECACA' }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Laporan Penjualan',
            value: formatCurrency(report.summary.totalSales),
            helper: `${report.summary.totalItemsSold.toLocaleString('id-ID')} item terjual`,
            icon: BadgeDollarSign,
            color: '#1D4ED8',
          },
          {
            label: 'Laporan Pemasukan',
            value: formatCurrency(report.summary.totalIncome),
            helper: `${latestComparison >= 0 ? '+' : ''}${latestComparison.toFixed(1)}% vs periode sebelumnya`,
            icon: Wallet,
            color: '#10B981',
          },
          {
            label: 'Laporan Transaksi',
            value: report.summary.totalTransactions.toLocaleString('id-ID'),
            helper: `Rata-rata ${formatCurrency(report.summary.averageTransaction)}`,
            icon: ReceiptText,
            color: '#F59E0B',
          },
          {
            label: 'Produk Terlaris',
            value: report.topProducts[0]?.name ?? (loading ? 'Memuat...' : 'Belum ada data'),
            helper: report.topProducts[0] ? `${report.topProducts[0].quantitySold.toLocaleString('id-ID')} unit terjual` : 'Tidak ada transaksi',
            icon: Package,
            color: '#8B5CF6',
          },
        ].map((card) => {
          const Icon = card.icon;

          return (
            <div key={card.label} className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${card.color}12` }}>
                  <Icon size={18} style={{ color: card.color }} />
                </div>
                {loading && <span className="text-xs" style={{ color: '#94A3B8' }}>Memuat...</span>}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#94A3B8' }}>{card.label}</div>
              <div className="mt-2 text-lg font-bold" style={{ color: '#0F172A' }}>{loading ? 'Memuat...' : card.value}</div>
              <div className="mt-1 text-xs" style={{ color: '#64748B' }}>{loading ? 'Mengambil data laporan...' : card.helper}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
          <div className="mb-4">
            <h2 className="text-base font-semibold" style={{ color: '#0F172A' }}>Grafik Penjualan dan Pemasukan</h2>
            <p className="text-xs" style={{ color: '#94A3B8' }}>Perbandingan gross sales dan total pemasukan berdasarkan periode terpilih.</p>
          </div>

          {report.salesBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={report.salesBreakdown}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="label" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="sales" stroke="#1D4ED8" fill="url(#salesFill)" strokeWidth={2} />
                <Area type="monotone" dataKey="income" stroke="#10B981" fill="url(#incomeFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm" style={{ color: '#94A3B8' }}>
              {loading ? 'Memuat grafik laporan...' : 'Belum ada data penjualan untuk periode ini.'}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
            <h2 className="mb-4 text-base font-semibold" style={{ color: '#0F172A' }}>Metode Pembayaran</h2>
            <div className="space-y-3">
              {report.paymentMethods.length > 0 ? report.paymentMethods.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span style={{ color: '#0F172A' }}>{item.label}</span>
                    <span style={{ color: '#1D4ED8' }}>{item.count.toLocaleString('id-ID')} trx</span>
                  </div>
                  <div className="text-xs" style={{ color: '#64748B' }}>{formatCurrency(item.amount)}</div>
                </div>
              )) : (
                <div className="text-sm" style={{ color: '#94A3B8' }}>{loading ? 'Memuat...' : 'Belum ada transaksi.'}</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
            <h2 className="mb-4 text-base font-semibold" style={{ color: '#0F172A' }}>Status Transaksi</h2>
            {report.statusBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={report.statusBreakdown}>
                  <CartesianGrid vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="label" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#0EA5E9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[180px] items-center justify-center text-sm" style={{ color: '#94A3B8' }}>
                {loading ? 'Memuat...' : 'Belum ada status transaksi.'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm" style={{ borderColor: '#E2E8F0' }}>
        <div className="border-b px-4 py-4" style={{ borderColor: '#F1F5F9' }}>
          <h2 className="text-base font-semibold" style={{ color: '#0F172A' }}>Laporan Penjualan</h2>
          <p className="text-xs" style={{ color: '#94A3B8' }}>Breakdown detail penjualan, pemasukan, transaksi, dan item per periode.</p>
        </div>
        <BreakdownTable rows={report.salesBreakdown} />
      </div>

      <div className="rounded-2xl border bg-white shadow-sm" style={{ borderColor: '#E2E8F0' }}>
        <div className="border-b px-4 py-4" style={{ borderColor: '#F1F5F9' }}>
          <h2 className="text-base font-semibold" style={{ color: '#0F172A' }}>Laporan Produk Terlaris</h2>
          <p className="text-xs" style={{ color: '#94A3B8' }}>Ranking produk berdasarkan kuantitas terjual dan kontribusi omzet.</p>
        </div>
        <ProductTable rows={report.topProducts} />
      </div>

      <div className="rounded-2xl border bg-white shadow-sm" style={{ borderColor: '#E2E8F0' }}>
        <div className="border-b px-4 py-4" style={{ borderColor: '#F1F5F9' }}>
          <h2 className="text-base font-semibold" style={{ color: '#0F172A' }}>Laporan Transaksi</h2>
          <p className="text-xs" style={{ color: '#94A3B8' }}>Daftar transaksi admin lengkap dengan pelanggan, item, metode pembayaran, status, dan total.</p>
        </div>
        <TransactionTable rows={report.transactions} />
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
        <h2 className="text-base font-semibold" style={{ color: '#0F172A' }}>Ringkasan Pemasukan</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl p-4" style={{ background: '#EFF6FF' }}>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1D4ED8' }}>Pemasukan Bersih</div>
            <div className="mt-2 text-lg font-bold" style={{ color: '#0F172A' }}>{formatCurrency(report.summary.totalIncome)}</div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: '#F0FDF4' }}>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#15803D' }}>Diskon</div>
            <div className="mt-2 text-lg font-bold" style={{ color: '#0F172A' }}>{formatCurrency(report.summary.totalDiscount)}</div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: '#FFF7ED' }}>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#C2410C' }}>Ongkir</div>
            <div className="mt-2 text-lg font-bold" style={{ color: '#0F172A' }}>{formatCurrency(report.summary.totalShipping)}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border px-4 py-3 text-xs" style={{ background: '#EFF6FF', color: '#1E40AF', borderColor: '#BFDBFE' }}>
        <Activity size={14} />
        Export Excel akan mengunduh file `.xls`, sedangkan export PDF membuka dokumen siap cetak untuk disimpan sebagai PDF.
      </div>
    </div>
  );
}
