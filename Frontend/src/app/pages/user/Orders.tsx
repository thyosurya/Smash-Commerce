import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Package, ChevronRight, Truck, CheckCircle, Clock, XCircle, Star, Store, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate, type Order } from '../../data/mockData';
import { fetchMyOrders } from '../../services/orderApi';
import { submitReview, fetchMyReviews, type Review } from '../../services/reviewApi';
import { toast } from 'sonner';

const STATUS_MAP = {
  pending:          { label: 'Menunggu',    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  icon: Clock },
  processing:       { label: 'Diproses',    color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  icon: Package },
  shipped:          { label: 'Dikirim',     color: '#0EA5E9', bg: 'rgba(14,165,233,0.12)',  icon: Truck },
  delivered:        { label: 'Terkirim',    color: '#10B981', bg: 'rgba(16,185,129,0.12)', icon: CheckCircle },
  ready_for_pickup: { label: 'Siap Diambil',color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', icon: Store },
  picked_up:        { label: 'Telah Diambil',color: '#10B981', bg: 'rgba(16,185,129,0.12)', icon: CheckCircle },
  cancelled:        { label: 'Dibatalkan',  color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  icon: XCircle },
} as Record<string, { label: string; color: string; bg: string; icon: React.ElementType }>;

const TABS = ['Semua', 'Aktif', 'Terkirim', 'Dibatalkan'];

// Satu panel review untuk satu product dalam satu order
function ReviewPanel({ orderId, productId, productName, onDone }: {
  orderId: string; productId: string; productName: string; onDone: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitReview({ orderId, productId, rating, comment: comment.trim() || undefined });
      toast.success('Ulasan berhasil dikirim! +50 poin reward 🌟');
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal mengirim ulasan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-2 p-3 rounded-xl" style={{ background: '#FFFBEB', border: '1px solid rgba(245,158,11,0.25)' }}>
      <p className="text-xs font-semibold mb-1" style={{ color: '#92400E' }}>Beri penilaian: <span style={{ color: '#0F172A' }}>{productName}</span></p>
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5].map(s => (
          <button key={s} onClick={() => setRating(s)}>
            <Star size={22} fill={s <= rating ? '#F59E0B' : 'none'} style={{ color: '#F59E0B' }} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Tulis ulasanmu (opsional)..."
        rows={2}
        className="w-full text-xs p-2.5 rounded-lg outline-none resize-none"
        style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#0F172A' }}
      />
      <div className="flex gap-2 mt-2">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 py-2 rounded-lg text-white text-xs font-semibold flex items-center justify-center gap-1"
          style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)' }}
        >
          {submitting ? <Loader2 size={13} className="animate-spin" /> : <Star size={13} />}
          {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
        </button>
        <button onClick={onDone} className="px-3 py-2 rounded-lg text-xs" style={{ background: '#F1F5F9', color: '#94A3B8' }}>
          Batal
        </button>
      </div>
    </div>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Semua');
  const [detailOpen, setDetailOpen] = useState<string | null>(null);
  // reviewOpen = { orderId, productId } yang sedang terbuka
  const [reviewOpen, setReviewOpen] = useState<{ orderId: string; productId: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Set of "orderId:productId" yang sudah direview
  const [reviewedSet, setReviewedSet] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersData, myReviews] = await Promise.all([fetchMyOrders(), fetchMyReviews()]);
      setOrders(ordersData);
      setReviewedSet(new Set(myReviews.map((r: Review) => `${r.orderId}:${r.productId}`)));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengambil data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filtered = orders.filter(o => {
    if (activeTab === 'Semua') return true;
    if (activeTab === 'Aktif') return ['pending', 'processing', 'shipped', 'ready_for_pickup'].includes(o.status);
    if (activeTab === 'Terkirim') return ['delivered', 'picked_up'].includes(o.status);
    if (activeTab === 'Dibatalkan') return o.status === 'cancelled';
    return true;
  });

  const canReview = (order: Order) => ['delivered', 'picked_up'].includes(order.status);

  return (
    <div className="min-h-screen" style={{ background: '#F0F4FF', fontFamily: "'Poppins', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 pt-10 pb-0" style={{ background: '#FFFFFF', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/profile')} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#F1F5F9', border: '1px solid #E2E8F0' }}>
            <ArrowLeft size={18} style={{ color: '#0F172A' }} />
          </button>
          <h1 className="font-bold text-lg" style={{ color: '#0F172A' }}>Pesanan Saya</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0"
              style={{
                background: activeTab === tab ? '#1D4ED8' : '#F1F5F9',
                color: activeTab === tab ? 'white' : '#94A3B8',
                border: activeTab === tab ? '1px solid #1D4ED8' : '1px solid #E2E8F0',
              }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4 space-y-3 pt-3">
        {error && (
          <div className="rounded-xl px-3 py-2 text-xs" style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FCA5A5' }}>
            {error}
            <button onClick={() => void loadData()} className="ml-2 underline">Coba lagi</button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-10 text-sm" style={{ color: '#94A3B8' }}>
            <Loader2 size={18} className="animate-spin" /> Memuat pesanan...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3" style={{ background: '#F1F5F9' }}>
              <Package size={32} style={{ color: '#CBD5E1' }} />
            </div>
            <p className="font-medium mb-1" style={{ color: '#0F172A' }}>Belum ada pesanan</p>
            <p className="text-sm" style={{ color: '#94A3B8' }}>Mulai belanja untuk melihat pesanan di sini</p>
          </div>
        )}

        {!loading && filtered.map(order => {
          const statusInfo = STATUS_MAP[order.status] ?? STATUS_MAP.pending;
          const StatusIcon = statusInfo.icon;
          const isDelivery = (order as Order & { shippingMethod?: string }).shippingMethod !== 'pickup';

          return (
            <div key={order.id} className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              {/* Order Header */}
              <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: '#F1F5F9' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>{order.id}</p>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>{formatDate(order.date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {(order as Order & { shippingMethod?: string }).shippingMethod && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                      style={(order as Order & { shippingMethod?: string }).shippingMethod === 'pickup'
                        ? { background: 'rgba(139,92,246,0.1)', color: '#7C3AED' }
                        : { background: 'rgba(14,165,233,0.1)', color: '#0EA5E9' }}>
                      {(order as Order & { shippingMethod?: string }).shippingMethod === 'pickup'
                        ? <><Store size={10} />Ambil</>
                        : <><Truck size={10} />Kirim</>}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: statusInfo.bg }}>
                    <StatusIcon size={11} style={{ color: statusInfo.color }} />
                    <span className="text-xs font-medium" style={{ color: statusInfo.color }}>{statusInfo.label}</span>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="px-4 py-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5">
                    <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-1" style={{ color: '#0F172A' }}>{item.product.name}</p>
                      <p className="text-xs" style={{ color: '#94A3B8' }}>Jml: {item.quantity} · {item.product.brand}</p>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t" style={{ borderColor: '#F1F5F9' }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>Total ({order.items.length} produk)</p>
                    <p className="font-bold" style={{ color: '#1D4ED8' }}>{formatCurrency(order.total)}</p>
                  </div>
                  {order.trackingNumber && isDelivery && (
                    <div className="text-right">
                      <p className="text-xs" style={{ color: '#94A3B8' }}>No. Resi</p>
                      <p className="text-xs font-medium" style={{ color: '#0EA5E9' }}>{order.trackingNumber}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#F1F5F9', color: '#94A3B8' }}>
                    {order.paymentMethod}
                  </span>
                  <div className="flex gap-2">
                    {canReview(order) && (
                      <button
                        onClick={() => setReviewOpen(
                          reviewOpen?.orderId === order.id ? null : { orderId: order.id, productId: order.items[0]?.product.id }
                        )}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg"
                        style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                        <Star size={11} /> Ulasan
                      </button>
                    )}
                    <button
                      onClick={() => setDetailOpen(detailOpen === order.id ? null : order.id)}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg"
                      style={{ background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' }}>
                      {detailOpen === order.id ? 'Sembunyikan' : 'Detail'}
                      <ChevronRight size={11} style={{ transform: detailOpen === order.id ? 'rotate(90deg)' : 'none' }} />
                    </button>
                  </div>
                </div>

                {/* Review panels — satu per produk */}
                {canReview(order) && reviewOpen?.orderId === order.id && (
                  <div className="mt-3 space-y-2">
                    {order.items.map((item, idx) => {
                      const key = `${order.id}:${item.product.id}`;
                      const alreadyReviewed = reviewedSet.has(key);
                      return (
                        <div key={idx}>
                          {alreadyReviewed ? (
                            <div className="p-2.5 rounded-xl text-xs flex items-center gap-2" style={{ background: 'rgba(16,185,129,0.08)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)' }}>
                              <CheckCircle size={13} /> {item.product.name} — sudah diulas
                            </div>
                          ) : (
                            <ReviewPanel
                              orderId={order.id}
                              productId={item.product.id}
                              productName={item.product.name}
                              onDone={() => {
                                setReviewedSet(prev => new Set([...prev, key]));
                                setReviewOpen(null);
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Detail Panel */}
                {detailOpen === order.id && (
                  <div className="mt-3 p-3 rounded-xl space-y-2" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <p className="text-xs font-semibold" style={{ color: '#0F172A' }}>Detail Pesanan</p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><p style={{ color: '#94A3B8' }}>Order ID</p><p style={{ color: '#0F172A' }}>{order.id}</p></div>
                      <div><p style={{ color: '#94A3B8' }}>Tanggal</p><p style={{ color: '#0F172A' }}>{formatDate(order.date)}</p></div>
                      <div><p style={{ color: '#94A3B8' }}>Pembayaran</p><p style={{ color: '#0F172A' }}>{order.paymentMethod}</p></div>
                      <div>
                        <p style={{ color: '#94A3B8' }}>{isDelivery ? 'No. Resi' : 'Metode'}</p>
                        <p style={{ color: '#0F172A' }}>{isDelivery ? (order.trackingNumber || '-') : '🏪 Ambil di Toko'}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t" style={{ borderColor: '#E2E8F0' }}>
                      <p className="text-xs mb-1" style={{ color: '#94A3B8' }}>Alamat</p>
                      <p className="text-xs" style={{ color: '#0F172A' }}>{order.address}</p>
                    </div>

                    <div className="pt-2 border-t" style={{ borderColor: '#E2E8F0' }}>
                      <p className="text-xs mb-2" style={{ color: '#94A3B8' }}>Produk</p>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={`${order.id}-${idx}`} className="flex items-start justify-between text-xs">
                            <div>
                              <p style={{ color: '#0F172A' }}>{item.product.name}</p>
                              <p style={{ color: '#94A3B8' }}>Jml {item.quantity} x {formatCurrency(item.price)}</p>
                              {item.customization && (
                                <p style={{ color: '#94A3B8' }}>
                                  {item.customization.stringType ? `Senar: ${item.customization.stringType}` : ''}
                                  {item.customization.tension ? ` · ${item.customization.tension} lbs` : ''}
                                  {item.customization.gripType ? `Grip: ${item.customization.gripType}` : ''}
                                </p>
                              )}
                            </div>
                            <p style={{ color: '#0F172A' }}>{formatCurrency(item.quantity * item.price)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t space-y-1 text-xs" style={{ borderColor: '#E2E8F0' }}>
                      <div className="flex justify-between"><span style={{ color: '#94A3B8' }}>Subtotal</span><span style={{ color: '#0F172A' }}>{formatCurrency(order.subtotal)}</span></div>
                      <div className="flex justify-between"><span style={{ color: '#94A3B8' }}>Ongkos Kirim</span><span style={{ color: '#0F172A' }}>{formatCurrency(order.shipping)}</span></div>
                      <div className="flex justify-between"><span style={{ color: '#94A3B8' }}>Diskon</span><span style={{ color: '#10B981' }}>-{formatCurrency(order.discount ?? 0)}</span></div>
                      <div className="flex justify-between pt-1" style={{ borderTop: '1px dashed #E2E8F0' }}>
                        <span style={{ color: '#0F172A' }}>Total Akhir</span>
                        <span style={{ color: '#1D4ED8', fontWeight: 700 }}>{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
