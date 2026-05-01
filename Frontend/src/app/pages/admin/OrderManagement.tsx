import { useEffect, useState, useCallback, useRef } from 'react';
import { Package, Search, RefreshCw, ChevronRight, ChevronLeft, Truck, Store, Clock, CheckCircle, XCircle, Loader2, AlertTriangle, Edit2, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { fetchAdminOrders, fetchOrderStats, updateOrderStatus, type AdminOrder, type OrderStats } from '../../services/orderApi';
import { formatCurrency, formatDate } from '../../data/mockData';

const STATUS_CFG = {
  pending:          { label: 'Menunggu',  color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  icon: Clock },
  processing:       { label: 'Diproses', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  icon: Package },
  shipped:          { label: 'Dikirim',  color: '#0EA5E9', bg: 'rgba(14,165,233,0.12)',  icon: Truck },
  delivered:        { label: 'Terkirim',color: '#10B981', bg: 'rgba(16,185,129,0.12)', icon: CheckCircle },
  ready_for_pickup: { label: 'Siap Diambil', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', icon: Store },
  picked_up:        { label: 'Telah Diambil',color: '#10B981', bg: 'rgba(16,185,129,0.12)', icon: CheckCircle },
  cancelled:        { label: 'Dibatalkan',color:'#EF4444', bg: 'rgba(239,68,68,0.12)',  icon: XCircle },
} as const;

type StatusKey = keyof typeof STATUS_CFG;
const STATUSES = Object.keys(STATUS_CFG) as StatusKey[];

const getNextStatus = (status: StatusKey, method: string): StatusKey | null => {
  if (status === 'pending') return 'processing';
  if (status === 'processing') return method === 'pickup' ? 'ready_for_pickup' : 'shipped';
  if (status === 'shipped') return 'delivered';
  if (status === 'ready_for_pickup') return 'picked_up';
  return null;
};

/* ─── Status Edit Modal ──────────────────────────────────────────── */
function StatusModal({ order, onClose, onSave }: {
  order: AdminOrder; onClose: () => void;
  onSave: (id: string, payload: { status: string; trackingNumber?: string; adminNote?: string }) => Promise<void>;
}) {
  const [status, setStatus] = useState(order.status);
  const [tracking, setTracking] = useState(order.trackingNumber ?? '');
  const [note, setNote] = useState(order.adminNote ?? '');
  const [saving, setSaving] = useState(false);

  const handle = async () => {
    setSaving(true);
    try {
      await onSave(order.id, { status, trackingNumber: tracking || undefined, adminNote: note || undefined });
      onClose();
    } finally { setSaving(false); }
  };

  const inp = 'w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-slate-200 bg-slate-50 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Update Status — <span className="text-blue-600">{order.id}</span></h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X size={18}/></button>
        </div>
        <div className="p-6 space-y-4">
          {/* Status selector */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 block">Status Pesanan</label>
            <div className="grid grid-cols-3 gap-2">
              {STATUSES.map(s => {
                const cfg = STATUS_CFG[s];
                const Icon = cfg.icon;
                return (
                  <button key={s} onClick={() => setStatus(s)}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-xs font-medium"
                    style={{ borderColor: status === s ? cfg.color : '#E2E8F0', background: status === s ? cfg.bg : '#F8FAFC', color: status === s ? cfg.color : '#94A3B8' }}>
                    <Icon size={16}/>{cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Tracking */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">No. Resi <span className="font-normal text-slate-400">(opsional)</span></label>
            <input className={inp} value={tracking} onChange={e => setTracking(e.target.value)} placeholder="SMASH1234567"/>
          </div>
          {/* Admin note */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Catatan Admin <span className="font-normal text-slate-400">(opsional)</span></label>
            <textarea className={`${inp} resize-none`} rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="Catatan internal..."/>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition">Batal</button>
            <button onClick={handle} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition"
              style={{ background: 'linear-gradient(135deg,#1D4ED8,#2563EB)' }}>
              {saving ? <Loader2 size={15} className="animate-spin"/> : <Save size={15}/>}
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Stat Card ──────────────────────────────────────────────────── */
function StatCard({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: React.FC<{size?:number;style?:React.CSSProperties}> }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
        <Icon size={18} style={{ color }}/>
      </div>
      <div>
        <p className="text-xl font-bold text-slate-800">{value.toLocaleString('id-ID')}</p>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function OrderManagement() {
  const [orders, setOrders]   = useState<AdminOrder[]>([]);
  const [stats, setStats]     = useState<OrderStats | null>(null);
  const [meta, setMeta]       = useState({ total: 0, current_page: 1, last_page: 1, per_page: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [search, setSearch]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [page, setPage]       = useState(1);
  const [editTarget, setEditTarget] = useState<AdminOrder | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const load = useCallback(async (p = page, s = search, sf = statusFilter, mf = methodFilter) => {
    setLoading(true); setError(null);
    try {
      const [res, statsRes] = await Promise.all([
        fetchAdminOrders({ page: p, search: s || undefined, status: sf || undefined, shipping_method: mf || undefined }),
        fetchOrderStats(),
      ]);
      setOrders(res.data); setMeta(res.meta); setStats(statsRes);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data.');
    } finally { setLoading(false); }
  }, [page, search, statusFilter, methodFilter]);

  useEffect(() => { void load(); }, [load]);

  const handleSearch = (v: string) => {
    setSearch(v); setPage(1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(1, v, statusFilter, methodFilter), 400);
  };

  const handleFilter = (sf: string, mf: string) => {
    setStatusFilter(sf); setMethodFilter(mf); setPage(1);
    void load(1, search, sf, mf);
  };

  const handleSaveStatus = async (id: string, payload: { status: string; trackingNumber?: string; adminNote?: string }) => {
    const updated = await updateOrderStatus(id, payload);
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
    toast.success(`Status order ${id} diperbarui ke ${STATUS_CFG[updated.status as StatusKey]?.label ?? updated.status}`);
    if (stats) {
      void fetchOrderStats().then(setStats);
    }
  };

  const quickUpdate = async (order: AdminOrder, nextStatus: StatusKey) => {
    try {
      await handleSaveStatus(order.id, { status: nextStatus });
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Gagal update'); }
  };

  return (
    <div className="p-5 space-y-5 min-h-screen" style={{ background: '#F1F5F9' }}>
      {editTarget && <StatusModal order={editTarget} onClose={() => setEditTarget(null)} onSave={handleSaveStatus}/>}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl text-slate-800 flex items-center gap-2"><Package size={20} className="text-blue-600"/> Manajemen Pesanan</h1>
          <p className="text-sm text-slate-400 mt-0.5">Kelola & perbarui status seluruh pesanan</p>
        </div>
        <button onClick={() => load()} disabled={loading}
          className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition border border-slate-200 bg-white">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''}/>
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <StatCard label="Menunggu"   value={stats.pending}    color="#F59E0B" icon={Clock}/>
          <StatCard label="Diproses"   value={stats.processing} color="#3B82F6" icon={Package}/>
          <StatCard label="Dikirim"    value={stats.shipped}    color="#0EA5E9" icon={Truck}/>
          <StatCard label="Terkirim"   value={stats.delivered}  color="#10B981" icon={CheckCircle}/>
          <StatCard label="Siap Diambil" value={stats.ready_for_pickup} color="#8B5CF6" icon={Store}/>
          <StatCard label="Diambil" value={stats.picked_up} color="#10B981" icon={CheckCircle}/>
          <StatCard label="Dibatalkan" value={stats.cancelled}  color="#EF4444" icon={XCircle}/>
        </div>
      )}

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm flex items-center gap-2 bg-red-50 text-red-700 border border-red-200">
          <AlertTriangle size={15}/> {error}
          <button onClick={() => load()} className="ml-auto text-xs underline">Coba lagi</button>
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input type="text" placeholder="Cari order ID / nama / email..." value={search} onChange={e => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-700"/>
          </div>
          {/* Status filter */}
          <select value={statusFilter} onChange={e => handleFilter(e.target.value, methodFilter)}
            className="py-2 px-3 text-sm border border-slate-200 rounded-xl outline-none text-slate-700 bg-white focus:border-blue-400">
            <option value="">Semua Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
          </select>
          {/* Method filter */}
          <select value={methodFilter} onChange={e => handleFilter(statusFilter, e.target.value)}
            className="py-2 px-3 text-sm border border-slate-200 rounded-xl outline-none text-slate-700 bg-white focus:border-blue-400">
            <option value="">Semua Metode</option>
            <option value="delivery">🚚 Dikirim</option>
            <option value="pickup">🏪 Ambil di Toko</option>
          </select>
          <span className="text-xs text-slate-400 ml-auto">{meta.total} pesanan</span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse"/>)}</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center"><Package size={36} className="mx-auto mb-3 text-slate-300"/><p className="text-slate-400 text-sm">Tidak ada pesanan ditemukan.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Pesanan</th>
                  <th className="px-5 py-3.5">Pelanggan</th>
                  <th className="px-5 py-3.5">Metode</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Total</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map(order => {
                  const cfg = STATUS_CFG[order.status as StatusKey] ?? STATUS_CFG.pending;
                  const Icon = cfg.icon;
                  const next = getNextStatus(order.status as StatusKey, order.shippingMethod);
                  const nextCfg = next ? STATUS_CFG[next] : null;
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{order.id}</p>
                        <p className="text-xs text-slate-400">{formatDate(order.date)}</p>
                        {order.trackingNumber && <p className="text-xs text-cyan-600 mt-0.5">📦 {order.trackingNumber}</p>}
                        {order.adminNote && <p className="text-xs text-amber-600 mt-0.5 italic">📝 {order.adminNote}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">{order.user?.name ?? '—'}</p>
                        <p className="text-xs text-slate-400">{order.user?.email}</p>
                        <p className="text-xs text-slate-400">{order.user?.phone}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: order.shippingMethod === 'pickup' ? 'rgba(139,92,246,0.1)' : 'rgba(14,165,233,0.1)', color: order.shippingMethod === 'pickup' ? '#7C3AED' : '#0EA5E9' }}>
                          {order.shippingMethod === 'pickup' ? <><Store size={11}/>Ambil Toko</> : <><Truck size={11}/>Dikirim</>}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: cfg.bg, color: cfg.color }}>
                          <Icon size={11}/>{cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-blue-600">{formatCurrency(order.total)}</p>
                        <p className="text-xs text-slate-400">{order.items.length} produk</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Quick advance button */}
                          {next && nextCfg && (
                            <button onClick={() => quickUpdate(order, next)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                              style={{ background: `${nextCfg.color}18`, color: nextCfg.color, border: `1px solid ${nextCfg.color}30` }}>
                              → {nextCfg.label}
                            </button>
                          )}
                          {/* Full edit */}
                          <button onClick={() => setEditTarget(order)}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition" title="Edit status">
                            <Edit2 size={15}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
            <span>Hal. {meta.current_page} dari {meta.last_page}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => { setPage(p => p-1); load(page-1); }}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition">
                <ChevronLeft size={16}/>
              </button>
              <button disabled={page >= meta.last_page} onClick={() => { setPage(p => p+1); load(page+1); }}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition">
                <ChevronRight size={16}/>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
