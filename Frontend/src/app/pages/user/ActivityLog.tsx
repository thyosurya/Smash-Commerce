import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ShoppingCart, Package, Star, Clock, Gift } from 'lucide-react';
import { fetchMyOrders } from '../../services/orderApi';
import { fetchPointHistoryApi } from '../../services/pointApi';

type ActivityItem = {
  id: string;
  type: 'cart' | 'purchase' | 'review' | 'points';
  productName?: string;
  productImage?: string;
  description: string;
  timestamp: string;
};

const TYPE_CONFIG = {
  cart: { icon: ShoppingCart, label: 'Ditambahkan ke Keranjang', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  purchase: { icon: Package, label: 'Dibeli', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  review: { icon: Star, label: 'Diulas', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  points: { icon: Gift, label: 'Poin Diterima', color: '#1D4ED8', bg: 'rgba(29,78,216,0.1)' },
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${mins}m ago`;
}

function groupByDate(activities: ActivityItem[]) {
  const groups: Record<string, ActivityItem[]> = {};
  activities.forEach(a => {
    const d = new Date(a.timestamp).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!groups[d]) groups[d] = [];
    groups[d].push(a);
  });
  return groups;
}

export default function ActivityLog() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadActivity = async () => {
      try {
        const [orders, points] = await Promise.all([fetchMyOrders(), fetchPointHistoryApi()]);

        const orderActivity: ActivityItem[] = orders.flatMap((order) => {
          const firstItem = order.items[0];
          const productName = firstItem?.product?.name;
          const productImage = firstItem?.product?.image;

          return [
            {
              id: `purchase-${order.id}`,
              type: 'purchase',
              productName,
              productImage,
              description: `Order ${order.id} dibuat dengan total ${order.total.toLocaleString('id-ID')}.`,
              timestamp: new Date(order.date).toISOString(),
            },
            {
              id: `cart-${order.id}`,
              type: 'cart',
              productName,
              productImage,
              description: `${order.items.length} item masuk checkout.`,
              timestamp: new Date(order.date).toISOString(),
            },
          ];
        });

        const pointActivity: ActivityItem[] = points.map((item) => ({
          id: `points-${item.id}`,
          type: 'points',
          description: `+${item.deltaPoints} poin dari ${item.source}. Saldo: ${item.balanceAfter.toLocaleString('id-ID')} pts.`,
          timestamp: item.createdAt ?? new Date().toISOString(),
        }));

        if (isMounted) {
          setActivities([...orderActivity, ...pointActivity].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadActivity();

    return () => {
      isMounted = false;
    };
  }, []);

  const groups = useMemo(() => groupByDate(activities), [activities]);

  return (
    <div className="min-h-screen" style={{ background: '#F0F4FF', fontFamily: "'Poppins', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 pt-10 pb-4" style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/profile')} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#F1F5F9', border: '1px solid #E2E8F0' }}>
            <ArrowLeft size={18} style={{ color: '#0F172A' }} />
          </button>
          <div>
            <h1 className="font-bold text-lg" style={{ color: '#0F172A' }}>Log Aktivitas</h1>
            <p className="text-xs" style={{ color: '#94A3B8' }}>Interaksi kamu terbaru</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-4 gap-2 mb-6">
          {Object.entries(TYPE_CONFIG).map(([type, config]) => {
            const Icon = config.icon;
            const count = activities.filter(a => a.type === type).length;
            return (
              <div key={type} className="rounded-2xl p-2.5 text-center bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-1" style={{ background: config.bg }}>
                  <Icon size={14} style={{ color: config.color }} />
                </div>
                <p className="font-bold text-base" style={{ color: '#0F172A' }}>{count}</p>
                <p className="text-[9px]" style={{ color: '#94A3B8' }}>{config.label.split(' ')[0]}</p>
              </div>
            );
          })}
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          {loading && (
            <div className="rounded-2xl p-3 text-xs" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#64748B' }}>
              Loading aktivitas...
            </div>
          )}

          {Object.entries(groups).map(([date, activities]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={13} style={{ color: '#94A3B8' }} />
                <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>{date}</span>
                <div className="flex-1 h-px" style={{ background: '#E2E8F0' }} />
              </div>

              <div className="space-y-2.5">
                {activities.map((activity, i) => {
                  const config = TYPE_CONFIG[activity.type];
                  const Icon = config.icon;
                  const isLast = i === activities.length - 1;
                  return (
                    <div key={activity.id} className="flex gap-3 relative">
                      {/* Timeline line */}
                      {!isLast && <div className="absolute left-5 top-10 bottom-0 w-px" style={{ background: '#E2E8F0' }} />}

                      {/* Icon */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10" style={{ background: config.bg, border: `1px solid ${config.color}25` }}>
                        <Icon size={16} style={{ color: config.color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 rounded-2xl p-3.5 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                        <div className="flex items-start gap-2">
                          {activity.productImage && (
                            <img src={activity.productImage} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: config.bg, color: config.color }}>
                                {config.label}
                              </span>
                              <span className="text-[10px]" style={{ color: '#94A3B8' }}>{timeAgo(activity.timestamp)}</span>
                            </div>
                            <p className="text-xs font-medium mt-1" style={{ color: '#0F172A' }}>{activity.productName}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>{activity.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
