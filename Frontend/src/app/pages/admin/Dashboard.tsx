import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { TrendingUp, Users, Package, ShoppingBag, DollarSign, ChevronRight, ArrowUpRight, BarChart3, Eye } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchAdminDashboard, type AdminDashboardData } from '../../services/adminDashboardApi';

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const formatCompactNumber = (value: number): string =>
  new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1 }).format(value);

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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="px-3 py-2 rounded-xl text-xs shadow-xl" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <p className="font-medium mb-1" style={{ color: '#0F172A' }}>{label}</p>
        <p style={{ color: '#1D4ED8' }}>Rp {(payload[0].value / 1000000).toFixed(1)}M</p>
        <p style={{ color: '#94A3B8' }}>{payload[1]?.value} orders</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<AdminDashboardData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const data = await fetchAdminDashboard();
        if (isMounted) {
          setDashboard(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Gagal mengambil data dashboard.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(
    () => [
      {
        label: 'Inventory Value',
        value: formatCurrency(dashboard.summary.inventoryValue),
        change: `${formatCompactNumber(dashboard.dailySales.reduce((sum, point) => sum + point.sales, 0))} / 7h`,
        up: true,
        icon: DollarSign,
        color: '#0EA5E9',
        sub: 'Nilai total stok produk',
      },
      {
        label: 'Total User Points',
        value: dashboard.summary.totalUserPoints.toLocaleString('id-ID'),
        change: `${dashboard.summary.pointsLast7Days.toLocaleString('id-ID')} / 7h`,
        up: true,
        icon: ShoppingBag,
        color: '#10B981',
        sub: 'Akumulasi poin seluruh user',
      },
      {
        label: 'Active Users',
        value: dashboard.summary.activeUsers.toLocaleString('id-ID'),
        change: 'Role user aktif',
        up: true,
        icon: Users,
        color: '#8B5CF6',
        sub: 'Total user non-admin',
      },
      {
        label: 'Total Products',
        value: dashboard.summary.totalProducts.toLocaleString('id-ID'),
        change: `${dashboard.summary.lowStockProducts.toLocaleString('id-ID')} low stock`,
        up: true,
        icon: Package,
        color: '#F59E0B',
        sub: 'Produk dalam katalog',
      },
    ],
    [dashboard],
  );

  const displayDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const dailySalesData = dashboard.dailySales;
  const monthlySalesData = dashboard.monthlySales;
  const topViewedProducts = dashboard.topProducts;

  return (
    <div className="p-5 space-y-5 min-h-screen" style={{ background: '#F1F5F9' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl" style={{ color: '#0F172A' }}>Dashboard</h1>
          <p className="text-sm capitalize" style={{ color: '#94A3B8' }}>{displayDate}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live
        </div>
      </div>

      {error && (
        <div className="rounded-xl px-3 py-2 text-xs" style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FCA5A5' }}>
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div className="flex items-start justify-between mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}12` }}>
                  <Icon size={17} style={{ color: s.color }} />
                </div>
                <span className="text-xs font-medium flex items-center gap-0.5" style={{ color: s.up ? '#10B981' : '#EF4444' }}>
                  <ArrowUpRight size={12} style={{ transform: s.up ? 'none' : 'rotate(180deg)' }} />
                  {s.change}
                </span>
              </div>
              <p className="font-bold text-lg leading-none line-clamp-1" style={{ color: '#0F172A' }}>{loading ? 'Loading...' : s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold" style={{ color: '#0F172A' }}>Inventory Growth</h3>
            <p className="text-xs" style={{ color: '#94A3B8' }}>7 hari terakhir (produk & user baru)</p>
          </div>
          <button onClick={() => navigate('/admin/reports')} className="flex items-center gap-1 text-xs font-medium" style={{ color: '#1D4ED8' }}>
            Full Report <ChevronRight size={13} />
          </button>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={dailySalesData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Area key="sales" type="monotone" dataKey="sales" stroke="#1D4ED8" strokeWidth={2} fill="url(#salesGrad)" dot={false} />
            <Area key="orders" type="monotone" dataKey="orders" stroke="#0EA5E9" strokeWidth={1.5} fill="none" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Summary */}
      <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold" style={{ color: '#0F172A' }}>Monthly Inventory Value</h3>
          <BarChart3 size={16} style={{ color: '#94A3B8' }} />
        </div>
        <div className="space-y-2">
          {monthlySalesData.slice(-4).map((d, i, arr) => {
            const maxSales = Math.max(1, ...arr.map(x => x.sales));
            const pct = Math.round((d.sales / maxSales) * 100);
            return (
              <div key={d.month} className="flex items-center gap-3">
                <span className="text-xs w-7" style={{ color: '#94A3B8' }}>{d.month}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: i === 3 ? '#1D4ED8' : '#93C5FD' }} />
                </div>
                <span className="text-xs font-medium w-14 text-right" style={{ color: '#0F172A' }}>Rp {(d.sales / 1000000).toFixed(0)}M</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Products */}
      <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold" style={{ color: '#0F172A' }}>Top Products (Review-Based)</h3>
          <button onClick={() => navigate('/admin/users')} className="flex items-center gap-1 text-xs font-medium" style={{ color: '#1D4ED8' }}>
            Analytics <ChevronRight size={13} />
          </button>
        </div>
        <div className="space-y-2.5">
          {topViewedProducts.slice(0, 4).map((tp, i) => (
            <div key={tp.product.id} className="flex items-center gap-3">
              <span className="text-xs font-bold w-5 text-center" style={{ color: i < 3 ? ['#F59E0B','#94A3B8','#CD7C32'][i] : '#CBD5E1' }}>
                #{i + 1}
              </span>
              <img src={tp.product.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium line-clamp-1" style={{ color: '#0F172A' }}>{tp.product.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-0.5 text-[10px]" style={{ color: '#0EA5E9' }}>
                    <Eye size={9} /> {tp.views.toLocaleString()}
                  </span>
                  <span className="text-[10px]" style={{ color: '#94A3B8' }}>→ {tp.purchases.toLocaleString()} sold</span>
                </div>
              </div>
              <span className="text-xs font-medium" style={{ color: '#10B981' }}>{formatCurrency(tp.product.price * tp.purchases).split(',')[0]}M</span>
            </div>
          ))}

          {topViewedProducts.length === 0 && (
            <p className="text-xs" style={{ color: '#94A3B8' }}>Belum ada data produk untuk ditampilkan.</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Add Product', path: '/admin/products', color: '#0EA5E9', icon: Package },
          { label: 'View Reports', path: '/admin/reports', color: '#10B981', icon: TrendingUp },
          { label: 'User Analytics', path: '/admin/users', color: '#8B5CF6', icon: Users },
          { label: 'Audit Log', path: '/admin/audit', color: '#F59E0B', icon: BarChart3 },
        ].map(({ label, path, color, icon: Icon }) => (
          <button key={label} onClick={() => navigate(path)}
            className="flex items-center gap-2 p-3.5 rounded-2xl text-sm font-medium text-left transition-colors hover:shadow-md bg-white"
            style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}12` }}>
              <Icon size={15} style={{ color }} />
            </div>
            <span style={{ color: '#0F172A' }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
