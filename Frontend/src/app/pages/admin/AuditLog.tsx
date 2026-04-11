import { useEffect, useMemo, useState } from 'react';
import { Search, DollarSign, Package, FileText, Settings, ShoppingBag, User } from 'lucide-react';
import { fetchAdminAuditLogs, type AdminAuditLogItem } from '../../services/adminAuditApi';

const TYPE_CONFIG = {
  price: { icon: DollarSign, color: '#0EA5E9', bg: 'rgba(14,165,233,0.1)', label: 'Price Update' },
  stock: { icon: Package, color: '#10B981', bg: 'rgba(16,185,129,0.1)', label: 'Stock Update' },
  product: { icon: FileText, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', label: 'Product' },
  crm: { icon: Settings, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: 'CRM' },
  order: { icon: ShoppingBag, color: '#EF4444', bg: 'rgba(239,68,68,0.1)', label: 'Order' },
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
}

export default function AuditLog() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [logs, setLogs] = useState<AdminAuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAuditLogs = async () => {
      try {
        setLoading(true);
        const data = await fetchAdminAuditLogs();
        if (isMounted) {
          setLogs(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Gagal mengambil audit log.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadAuditLogs();

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch = !search || l.action.toLowerCase().includes(search.toLowerCase()) || l.detail.toLowerCase().includes(search.toLowerCase()) || l.admin.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || l.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [logs, search, typeFilter]);

  const summary = useMemo(
    () => ({
      price: logs.filter((l) => l.type === 'price').length,
      stock: logs.filter((l) => l.type === 'stock').length,
      product: logs.filter((l) => l.type === 'product').length,
    }),
    [logs],
  );

  return (
    <div className="p-5 space-y-5 min-h-screen" style={{ background: '#F1F5F9' }}>
      {/* Header */}
      <div>
        <h1 className="font-bold text-xl" style={{ color: '#0F172A' }}>Audit Log</h1>
        <p className="text-sm" style={{ color: '#94A3B8' }}>Admin activity history & changes</p>
      </div>

      {error && (
        <div className="rounded-xl px-3 py-2 text-xs" style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FCA5A5' }}>
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Price Changes', count: summary.price, color: '#0EA5E9' },
          { label: 'Stock Updates', count: summary.stock, color: '#10B981' },
          { label: 'Products', count: summary.product, color: '#8B5CF6' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-3 text-center bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <p className="font-bold text-lg" style={{ color: '#0F172A' }}>{s.count}</p>
            <p className="text-[10px]" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search activity..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none bg-white"
          style={{ border: '1px solid #E2E8F0', color: '#0F172A', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        <button onClick={() => setTypeFilter('all')}
          className="px-3 py-1 rounded-full text-xs whitespace-nowrap shrink-0"
          style={{ background: typeFilter === 'all' ? '#1D4ED8' : '#FFFFFF', color: typeFilter === 'all' ? 'white' : '#94A3B8', border: typeFilter === 'all' ? '1px solid #1D4ED8' : '1px solid #E2E8F0' }}>
          All ({logs.length})
        </button>
        {Object.entries(TYPE_CONFIG).map(([type, config]) => (
          <button key={type} onClick={() => setTypeFilter(type)}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs whitespace-nowrap shrink-0"
            style={{ background: typeFilter === type ? config.color : '#FFFFFF', color: typeFilter === type ? 'white' : '#94A3B8', border: typeFilter === type ? '1px solid transparent' : '1px solid #E2E8F0' }}>
            {config.label}
          </button>
        ))}
      </div>

      {/* Log Entries */}
      <div className="space-y-2.5">
        {loading && (
          <div className="text-center py-12">
            <FileText size={32} style={{ color: '#CBD5E1' }} className="mx-auto mb-2" />
            <p style={{ color: '#0F172A' }}>Loading audit logs...</p>
          </div>
        )}

        {filtered.map((log, i) => {
          const config = TYPE_CONFIG[log.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.product;
          const Icon = config.icon;
          const isLast = i === filtered.length - 1;
          return (
            <div key={log.id} className="flex gap-3 relative">
              {!isLast && <div className="absolute left-5 top-10 bottom-0 w-px" style={{ background: '#E2E8F0' }} />}

              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10" style={{ background: config.bg, border: `1px solid ${config.color}25` }}>
                <Icon size={16} style={{ color: config.color }} />
              </div>

              <div className="flex-1 rounded-2xl p-3.5 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: config.bg, color: config.color }}>
                      {config.label}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: '#0F172A' }}>{log.action}</span>
                  </div>
                  <span className="text-[10px] shrink-0" style={{ color: '#94A3B8' }}>{timeAgo(log.timestamp)}</span>
                </div>
                <p className="text-xs mt-1" style={{ color: '#475569' }}>{log.detail}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#F1F5F9' }}>
                    <User size={10} style={{ color: '#94A3B8' }} />
                  </div>
                  <span className="text-[10px]" style={{ color: '#94A3B8' }}>{log.admin}</span>
                  <span className="text-[10px]" style={{ color: '#E2E8F0' }}>·</span>
                  <span className="text-[10px]" style={{ color: '#94A3B8' }}>{new Date(log.timestamp).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          );
        })}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <FileText size={32} style={{ color: '#CBD5E1' }} className="mx-auto mb-2" />
            <p style={{ color: '#0F172A' }}>No activity found</p>
          </div>
        )}
      </div>
    </div>
  );
}
