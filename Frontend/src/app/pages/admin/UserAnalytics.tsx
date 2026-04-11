import { useEffect, useMemo, useState } from 'react';
import { Eye, ShoppingCart, Package, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchAdminDashboard, type AdminDashboardData } from '../../services/adminDashboardApi';

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

export default function UserAnalytics() {
  const [dashboard, setDashboard] = useState<AdminDashboardData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadUserAnalytics = async () => {
      try {
        setLoading(true);
        const data = await fetchAdminDashboard();
        if (isMounted) {
          setDashboard(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Gagal mengambil data user analytics.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadUserAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalUsers = dashboard.summary.activeUsers;

  const userTierData = useMemo(() => {
    if (dashboard.userTierDistribution.length > 0) {
      return dashboard.userTierDistribution;
    }

    const tierRatios = [
      { tier: 'Newbie', ratio: 0.4, color: '#94A3B8' },
      { tier: 'Amateur', ratio: 0.3, color: '#10B981' },
      { tier: 'Pro', ratio: 0.2, color: '#2563EB' },
      { tier: 'Champion', ratio: 0.1, color: '#F59E0B' },
    ];

    const base = Math.max(totalUsers, 0);

    return tierRatios.map((item, index) => {
      if (index < tierRatios.length - 1) {
        return {
          tier: item.tier,
          count: Math.round(base * item.ratio),
          color: item.color,
        };
      }

      const previousSum = tierRatios
        .slice(0, index)
        .reduce((sum, tier) => sum + Math.round(base * tier.ratio), 0);

      return {
        tier: item.tier,
        count: Math.max(base - previousSum, 0),
        color: item.color,
      };
    });
  }, [totalUsers]);

  const topViewedProducts = dashboard.topProducts;

  const abandonedCartProducts = useMemo(() => {
    return dashboard.topProducts
      .map((item) => {
        const cartAdds = Math.max(item.cartAdds, 1);
        const conversions = Math.min(item.purchases, cartAdds);
        const abandonRate = Math.round(((cartAdds - conversions) / cartAdds) * 100);

        return {
          product: item.product,
          cartAdds,
          conversions,
          abandonRate: Math.max(abandonRate, 0),
        };
      })
      .sort((a, b) => b.abandonRate - a.abandonRate)
      .slice(0, 4);
  }, [dashboard.topProducts]);

  const generatedAt = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dashboard.generatedAt));

  return (
    <div className="p-5 space-y-5 min-h-screen" style={{ background: '#F1F5F9' }}>
      <div>
        <h1 className="font-bold text-xl" style={{ color: '#0F172A' }}>User Analytics</h1>
        <p className="text-sm" style={{ color: '#94A3B8' }}>Behavior & engagement insights • Updated {generatedAt}</p>
      </div>

      {error && (
        <div className="rounded-xl px-3 py-2 text-xs" style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FCA5A5' }}>
          {error}
        </div>
      )}

      {/* User Tier Distribution */}
      <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <h3 className="font-semibold mb-4" style={{ color: '#0F172A' }}>User Tier Distribution</h3>
        <div className="space-y-3">
          {userTierData.map(t => {
            const total = userTierData.reduce((s, d) => s + d.count, 0);
            const pct = Math.round((t.count / total) * 100);
            return (
              <div key={t.tier} className="flex items-center gap-3">
                <span className="text-xs font-medium w-14" style={{ color: t.color }}>{t.tier}</span>
                <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: t.color }} />
                </div>
                <span className="text-xs font-medium w-10 text-right" style={{ color: '#0F172A' }}>{t.count}</span>
                <span className="text-xs w-8 text-right" style={{ color: '#94A3B8' }}>{pct}%</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 p-2.5 rounded-xl text-xs" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <span style={{ color: '#94A3B8' }}>Total registered users: </span>
          <span className="font-semibold" style={{ color: '#0F172A' }}>{loading ? 'Loading...' : userTierData.reduce((s, d) => s + d.count, 0).toLocaleString('id-ID')}</span>
        </div>
      </div>

      <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <h3 className="font-semibold mb-3" style={{ color: '#0F172A' }}>Top Point Users</h3>
        <p className="text-xs mb-3" style={{ color: '#94A3B8' }}>Kumulatif poin user tertinggi</p>
        <div className="space-y-2">
          {dashboard.topPointUsers.length === 0 && (
            <p className="text-xs" style={{ color: '#94A3B8' }}>{loading ? 'Memuat data poin...' : 'Belum ada data poin user.'}</p>
          )}
          {dashboard.topPointUsers.map((user, index) => (
            <div key={user.id} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color: '#1D4ED8' }}>#{index + 1}</span>
                <span className="text-sm font-medium" style={{ color: '#0F172A' }}>{user.name}</span>
              </div>
              <span className="text-xs font-semibold" style={{ color: '#F59E0B' }}>{user.points.toLocaleString('id-ID')} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Most Viewed Products */}
      <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Eye size={16} style={{ color: '#0EA5E9' }} />
          <h3 className="font-semibold" style={{ color: '#0F172A' }}>Most Viewed Products</h3>
        </div>
        <div className="space-y-3">
          {topViewedProducts.length === 0 && (
            <p className="text-xs" style={{ color: '#94A3B8' }}>{loading ? 'Memuat data produk...' : 'Belum ada data produk.'}</p>
          )}
          {topViewedProducts.map((tp, i) => {
            const cvr = tp.views > 0 ? Math.round((tp.purchases / tp.views) * 100) : 0;
            return (
              <div key={tp.product.id} className="rounded-xl p-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold w-5" style={{ color: i < 3 ? ['#F59E0B', '#94A3B8', '#CD7C32'][i] : '#CBD5E1' }}>
                    #{i + 1}
                  </span>
                  <img src={tp.product.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-1" style={{ color: '#0F172A' }}>{tp.product.name}</p>
                    <p className="text-[10px]" style={{ color: '#94A3B8' }}>{tp.product.brand} · {tp.product.category}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Views', value: tp.views.toLocaleString(), color: '#0EA5E9', icon: Eye },
                    { label: 'Cart Adds', value: tp.cartAdds.toLocaleString(), color: '#8B5CF6', icon: ShoppingCart },
                    { label: 'Purchases', value: tp.purchases.toLocaleString(), color: '#10B981', icon: Package },
                  ].map(s => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label} className="text-center p-1.5 rounded-lg bg-white" style={{ border: '1px solid #E2E8F0' }}>
                        <Icon size={11} style={{ color: s.color }} className="mx-auto mb-0.5" />
                        <p className="text-xs font-bold" style={{ color: '#0F172A' }}>{s.value}</p>
                        <p className="text-[9px]" style={{ color: '#94A3B8' }}>{s.label}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px]" style={{ color: '#94A3B8' }}>Conversion Rate</span>
                  <span className="text-xs font-semibold" style={{ color: cvr > 15 ? '#10B981' : cvr > 8 ? '#F59E0B' : '#EF4444' }}>
                    {cvr}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Abandoned Cart */}
      <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} style={{ color: '#F59E0B' }} />
          <h3 className="font-semibold" style={{ color: '#0F172A' }}>High Cart Abandonment</h3>
        </div>
        <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>Products frequently added but not purchased</p>
        <div className="space-y-3">
          {abandonedCartProducts.length === 0 && (
            <p className="text-xs" style={{ color: '#94A3B8' }}>{loading ? 'Memuat data abandonment...' : 'Belum ada data abandonment.'}</p>
          )}
          {abandonedCartProducts.map(ap => (
            <div key={ap.product.id} className="rounded-xl p-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div className="flex items-center gap-3 mb-2">
                <img src={ap.product.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-xs font-medium line-clamp-1" style={{ color: '#0F172A' }}>{ap.product.name}</p>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>{formatCurrency(ap.product.price)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: '#EF4444' }}>{ap.abandonRate}%</p>
                  <p className="text-[10px]" style={{ color: '#94A3B8' }}>abandon</p>
                </div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                <div className="h-full rounded-full" style={{ width: `${ap.abandonRate}%`, background: ap.abandonRate > 60 ? '#EF4444' : '#F59E0B' }} />
              </div>
              <div className="flex justify-between text-[10px] mt-1" style={{ color: '#94A3B8' }}>
                <span>{ap.cartAdds} cart adds</span>
                <span>{ap.conversions} converted</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Bar Chart */}
      <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <h3 className="font-semibold mb-4" style={{ color: '#0F172A' }}>Product Engagement Funnel</h3>
        {topViewedProducts.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={topViewedProducts.map(t => ({ name: t.product.name.split(' ').slice(0, 2).join(' '), views: t.views, cart: t.cartAdds, sold: t.purchases }))} barSize={14} barGap={2}>
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '11px', color: '#0F172A' }} />
              <Bar key="views" dataKey="views" fill="#0EA5E9" radius={[3, 3, 0, 0]} name="Views" />
              <Bar key="cart" dataKey="cart" fill="#8B5CF6" radius={[3, 3, 0, 0]} name="Cart Adds" />
              <Bar key="sold" dataKey="sold" fill="#10B981" radius={[3, 3, 0, 0]} name="Purchases" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[180px] flex items-center justify-center text-xs" style={{ color: '#94A3B8' }}>
            {loading ? 'Memuat data funnel...' : 'Belum ada data funnel.'}
          </div>
        )}
      </div>
    </div>
  );
}