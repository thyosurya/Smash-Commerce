import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { TrendingUp, AlertTriangle, DollarSign, ShoppingBag, Activity } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { fetchAdminDashboard, type AdminDashboardData, type DashboardSeriesPoint } from '../../services/adminDashboardApi';

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const INITIAL_DATA: AdminDashboardData = {
  summary: {
    inventoryValue: 0,
    totalProducts: 0,
    activeUsers: 0,
    lowStockProducts: 0,
    totalUserPoints: 0,
    pointsLast7Days: 0,
  },
  dailySales: [],
  monthlySales: [],
  dailyPointFlow: [],
  userTierDistribution: [],
  topPointUsers: [],
  topProducts: [],
  generatedAt: new Date().toISOString(),
};

const CATEGORY_COLORS = ['#1D4ED8', '#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl shadow-xl text-xs" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
      <p className="font-medium mb-1" style={{ color: '#0F172A' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === 'sales' ? formatCurrency(p.value) : `${p.value} orders`}
        </p>
      ))}
    </div>
  );
};

export default function SalesReport() {
  const [period, setPeriod] = useState<'daily' | 'monthly'>('daily');
  const [dashboard, setDashboard] = useState<AdminDashboardData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSalesReport = async () => {
      try {
        setLoading(true);
        const data = await fetchAdminDashboard();
        if (isMounted) {
          setDashboard(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Gagal mengambil data sales report.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadSalesReport();

    return () => {
      isMounted = false;
    };
  }, []);

  const dailySalesData = dashboard.dailySales;
  const monthlySalesData = dashboard.monthlySales;
  const data = period === 'daily' ? dailySalesData : monthlySalesData;
  const xKey = period === 'daily' ? 'day' : 'month';

  const totalRevenue = monthlySalesData.reduce((s, d) => s + d.sales, 0);
  const totalOrders = monthlySalesData.reduce((s, d) => s + d.orders, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const lowStockRate = dashboard.summary.totalProducts > 0
    ? (dashboard.summary.lowStockProducts / dashboard.summary.totalProducts) * 100
    : 0;

  const latestMonthGrowth = useMemo(() => {
    if (monthlySalesData.length < 2) return 0;
    const latest = monthlySalesData[monthlySalesData.length - 1].sales;
    const previous = monthlySalesData[monthlySalesData.length - 2].sales;

    if (previous <= 0) return latest > 0 ? 100 : 0;

    return ((latest - previous) / previous) * 100;
  }, [monthlySalesData]);

  const categoryData = useMemo(() => {
    const totalPurchases = dashboard.topProducts.reduce((sum, item) => sum + item.purchases, 0);

    if (totalPurchases === 0) {
      return [{ name: 'Belum ada data', value: 100, color: '#CBD5E1' }];
    }

    const grouped = dashboard.topProducts.reduce<Record<string, number>>((acc, item) => {
      const label = item.product.category;
      acc[label] = (acc[label] || 0) + item.purchases;
      return acc;
    }, {});

    return Object.entries(grouped).map(([name, purchases], index) => ({
      name,
      value: Math.round((purchases / totalPurchases) * 100),
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }));
  }, [dashboard.topProducts]);

  const maxMonthlySales = Math.max(1, ...monthlySalesData.map((point) => point.sales));
  const generatedAt = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dashboard.generatedAt));

  const renderSeriesText = (point: DashboardSeriesPoint): string =>
    point.day ?? point.month ?? '-';

  return (
    <div className="p-5 space-y-5 min-h-screen" style={{ background: '#F1F5F9' }}>
      <div>
        <h1 className="font-bold text-xl" style={{ color: '#0F172A' }}>Sales Report</h1>
        <p className="text-sm" style={{ color: '#94A3B8' }}>Performance overview & analytics • Updated {generatedAt}</p>
      </div>

      {error && (
        <div className="rounded-xl px-3 py-2 text-xs" style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FCA5A5' }}>
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: 'Total Revenue',
            value: loading ? 'Loading...' : formatCurrency(totalRevenue),
            icon: DollarSign,
            color: '#0EA5E9',
            change: `${latestMonthGrowth >= 0 ? '+' : ''}${latestMonthGrowth.toFixed(1)}%`,
            up: latestMonthGrowth >= 0,
          },
          {
            label: 'Total Orders',
            value: loading ? 'Loading...' : totalOrders.toLocaleString('id-ID'),
            icon: ShoppingBag,
            color: '#10B981',
            change: `${dailySalesData.reduce((sum, point) => sum + point.orders, 0)} / 7h`,
            up: true,
          },
          {
            label: 'Avg Order Value',
            value: loading ? 'Loading...' : formatCurrency(avgOrderValue),
            icon: TrendingUp,
            color: '#8B5CF6',
            change: 'Revenue / Orders',
            up: true,
          },
          {
            label: 'Low Stock Rate',
            value: loading ? 'Loading...' : `${lowStockRate.toFixed(1)}%`,
            icon: AlertTriangle,
            color: '#EF4444',
            change: `${dashboard.summary.lowStockProducts} produk`,
            up: false,
          },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}12` }}>
                  <Icon size={16} style={{ color: s.color }} />
                </div>
                <span className="text-xs" style={{ color: s.up ? '#10B981' : '#EF4444' }}>{s.change}</span>
              </div>
              <p className="font-bold text-sm" style={{ color: '#0F172A' }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Period Toggle */}
      <div className="flex gap-2">
        {(['daily', 'monthly'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className="px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all"
            style={{ background: period === p ? '#1D4ED8' : '#FFFFFF', color: period === p ? 'white' : '#94A3B8', border: period === p ? '1px solid #1D4ED8' : '1px solid #E2E8F0' }}>
            {p === 'daily' ? 'Last 7 Days' : 'Last 7 Months'}
          </button>
        ))}
      </div>

      {/* Area Chart */}
      <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <h3 className="font-semibold mb-4" style={{ color: '#0F172A' }}>Revenue Trend</h3>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey={xKey} tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area key="sales" type="monotone" dataKey="sales" name="sales" stroke="#1D4ED8" strokeWidth={2} fill="url(#revGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-xs" style={{ color: '#94A3B8' }}>
            {loading ? 'Memuat data revenue...' : 'Belum ada data revenue.'}
          </div>
        )}
      </div>

      {/* Bar Chart - Orders */}
      <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <h3 className="font-semibold mb-4" style={{ color: '#0F172A' }}>Orders Volume</h3>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data} barSize={22}>
              <XAxis dataKey={xKey} tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar key="orders" dataKey="orders" name="orders" radius={[4, 4, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={i === data.length - 1 ? '#1D4ED8' : '#93C5FD'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[160px] flex items-center justify-center text-xs" style={{ color: '#94A3B8' }}>
            {loading ? 'Memuat data orders...' : 'Belum ada data order.'}
          </div>
        )}
      </div>

      {/* Category Pie */}
      <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <h3 className="font-semibold mb-4" style={{ color: '#0F172A' }}>Sales by Category</h3>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={categoryData} cx="50%" cy="45%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
              {categoryData.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Legend iconType="circle" iconSize={8}
              formatter={(value) => <span style={{ color: '#475569', fontSize: '11px' }}>{value}</span>} />
            <Tooltip formatter={(v) => [`${v}%`, 'Share']} contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', color: '#0F172A', fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Table */}
      <div className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div className="p-4 border-b" style={{ borderColor: '#F1F5F9' }}>
          <h3 className="font-semibold" style={{ color: '#0F172A' }}>Monthly Breakdown</h3>
        </div>
        <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as CSSProperties}>
          {monthlySalesData.length > 0 ? monthlySalesData.slice().reverse().map(d => (
            <div key={d.month} className="flex items-center px-4 py-3 gap-3" style={{ borderColor: '#F1F5F9' }}>
              <span className="w-10 text-sm font-medium" style={{ color: '#0F172A' }}>{renderSeriesText(d)}</span>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: '#94A3B8' }}>{d.orders.toLocaleString('id-ID')} orders</span>
                  <span style={{ color: '#1D4ED8' }}>{formatCurrency(d.sales)}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                  <div className="h-full rounded-full" style={{ width: `${(d.sales / maxMonthlySales) * 100}%`, background: 'linear-gradient(90deg, #1D4ED8, #0EA5E9)' }} />
                </div>
              </div>
            </div>
          )) : (
            <div className="px-4 py-8 text-center text-xs" style={{ color: '#94A3B8' }}>
              {loading ? 'Memuat ringkasan bulanan...' : 'Belum ada data bulanan.'}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl px-3 py-2 text-xs flex items-center gap-2" style={{ background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE' }}>
        <Activity size={14} /> Data report bersumber dari endpoint admin dan diperbarui saat halaman dibuka.
      </div>
    </div>
  );
}