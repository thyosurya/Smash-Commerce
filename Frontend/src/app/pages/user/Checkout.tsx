import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, CreditCard, ChevronRight, CheckCircle, Building2, Wallet, Truck, Store } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../data/mockData';
import { earnPointsApi } from '../../services/pointApi';
import { createOrderApi } from '../../services/orderApi';
import { toast } from 'sonner';

const PAYMENT_METHODS = [
  { id: 'transfer', label: 'Transfer Bank',       icon: Building2, desc: 'BCA, Mandiri, BNI, BRI' },
  { id: 'gopay',   label: 'GoPay',               icon: Wallet,    desc: 'Pembayaran instan' },
  { id: 'ovo',     label: 'OVO',                 icon: Wallet,    desc: 'Pembayaran instan' },
  { id: 'card',    label: 'Kartu Kredit / Debit', icon: CreditCard, desc: 'Visa, Mastercard, JCB' },
];

const SHIPPING_OPTIONS = [
  {
    id: 'delivery' as const,
    label: 'Dikirim ke Alamat',
    desc: 'Estimasi 2–4 hari kerja',
    fee: 25000,
    icon: Truck,
    color: '#0EA5E9',
    badge: 'Pengiriman',
  },
  {
    id: 'pickup' as const,
    label: 'Ambil di Toko',
    desc: 'Smash Commerce — Jl. Badminton No. 1, Jakarta',
    fee: 0,
    icon: Store,
    color: '#8B5CF6',
    badge: 'Gratis',
  },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { state, cartTotal, clearCart, dispatch } = useApp();

  const [step, setStep] = useState<'shipping' | 'address' | 'payment' | 'review'>('shipping');
  const [loading, setLoading] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState({
    name: state.user?.name || '', phone: state.user?.phone || '',
    street: '', city: '', province: '', zip: '', notes: '',
  });
  const [payment, setPayment] = useState('transfer');

  const selectedShipping = SHIPPING_OPTIONS.find(o => o.id === shippingMethod)!;
  const shipping = selectedShipping.fee;
  const discount = cartTotal > 2000000 ? Math.round(cartTotal * 0.05) : 0;
  const total    = cartTotal + shipping - discount;

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setAddress(a => ({ ...a, [k]: e.target.value }));

  // address step is skipped for pickup (we still collect name+phone only)
  const steps = [
    { id: 'shipping', label: 'Pengiriman' },
    { id: 'address',  label: shippingMethod === 'pickup' ? 'Kontak' : 'Alamat' },
    { id: 'payment',  label: 'Pembayaran' },
    { id: 'review',   label: 'Tinjau' },
  ];
  const stepIdx = steps.findIndex(s => s.id === step);

  const handlePlaceOrder = async () => {
    if (state.cart.length === 0) { toast.error('Keranjang kosong.'); return; }
    setLoading(true);
    try {
      const deliveryAddress = shippingMethod === 'pickup'
        ? `[Ambil di Toko] ${address.name} · ${address.phone}`
        : `${address.street}, ${address.city}, ${address.province} ${address.zip}`;

      const placedOrder = await createOrderApi({
        items: state.cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          customization: item.customization,
        })),
        address: deliveryAddress,
        paymentMethod: PAYMENT_METHODS.find(m => m.id === payment)?.label || payment,
        shippingMethod,
        phone: address.phone || undefined,
        shipping,
        discount,
      });

      clearCart();

      let earnedPoints = 0;
      let currentPoints = state.user?.points ?? 0;
      try {
        const pr = await earnPointsApi({ totalAmount: placedOrder.total, source: 'purchase', reference: placedOrder.id, note: 'Point dari checkout.', meta: { paymentMethod: placedOrder.paymentMethod } });
        earnedPoints = pr.earnedPoints;
        currentPoints = pr.currentPoints;
        dispatch({ type: 'UPDATE_USER_POINTS', payload: currentPoints });
      } catch { toast.error('Order berhasil, tapi sinkronisasi poin gagal.'); }

      navigate('/order-success', { state: { orderId: placedOrder.id, total: placedOrder.total, earnedPoints, currentPoints } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal membuat order.');
    } finally { setLoading(false); }
  };

  const inputClass = 'w-full px-3.5 py-2.5 rounded-xl text-sm outline-none';
  const inputStyle = { background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#0F172A' };
  const focusIn  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => e.currentTarget.style.borderColor = '#1D4ED8';
  const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => e.currentTarget.style.borderColor = '#E2E8F0';

  const addressRequired = shippingMethod === 'delivery';
  const canNextAddress = addressRequired
    ? !!(address.name && address.street && address.city)
    : !!(address.name && address.phone);

  return (
    <div className="min-h-screen" style={{ background: '#F0F4FF', fontFamily: "'Poppins', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 pt-10 pb-4" style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/cart')} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#F1F5F9', border: '1px solid #E2E8F0' }}>
            <ArrowLeft size={18} style={{ color: '#0F172A' }}/>
          </button>
          <h1 className="font-bold text-lg" style={{ color: '#0F172A' }}>Checkout</h1>
        </div>
        {/* Step indicator */}
        <div className="flex items-center gap-1">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{ background: i < stepIdx ? '#10B981' : i === stepIdx ? '#1D4ED8' : '#F1F5F9', color: i < stepIdx || i === stepIdx ? 'white' : '#94A3B8', border: i === stepIdx ? '2px solid #93C5FD' : '2px solid transparent' }}>
                  {i < stepIdx ? <CheckCircle size={12}/> : i + 1}
                </div>
                <span className="text-xs" style={{ color: i === stepIdx ? '#1D4ED8' : i < stepIdx ? '#10B981' : '#94A3B8' }}>{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className="flex-1 h-px mx-1" style={{ background: i < stepIdx ? '#10B981' : '#E2E8F0', width: '20px' }}/>}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* ── Step 1: Shipping Method ── */}
        {step === 'shipping' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Truck size={16} style={{ color: '#1D4ED8' }}/>
              <h2 className="font-semibold" style={{ color: '#0F172A' }}>Metode Pengiriman</h2>
            </div>
            <div className="space-y-3">
              {SHIPPING_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const selected = shippingMethod === opt.id;
                return (
                  <button key={opt.id} onClick={() => setShippingMethod(opt.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all bg-white"
                    style={{ border: `2px solid ${selected ? opt.color : '#E2E8F0'}`, boxShadow: selected ? `0 0 0 3px ${opt.color}20` : '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: selected ? `${opt.color}18` : '#F1F5F9' }}>
                      <Icon size={22} style={{ color: selected ? opt.color : '#94A3B8' }}/>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm" style={{ color: '#0F172A' }}>{opt.label}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: `${opt.color}18`, color: opt.color }}>{opt.badge}</span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{opt.desc}</p>
                      <p className="text-sm font-bold mt-1" style={{ color: opt.fee === 0 ? '#10B981' : '#0F172A' }}>
                        {opt.fee === 0 ? 'Gratis' : formatCurrency(opt.fee)}
                      </p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                      style={{ borderColor: selected ? opt.color : '#E2E8F0' }}>
                      {selected && <div className="w-2.5 h-2.5 rounded-full" style={{ background: opt.color }}/>}
                    </div>
                  </button>
                );
              })}
            </div>
            <button onClick={() => setStep('address')}
              className="w-full py-3.5 rounded-2xl text-white font-semibold flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#1D4ED8,#2563EB)', boxShadow: '0 4px 20px rgba(29,78,216,0.35)' }}>
              Lanjut ke {shippingMethod === 'pickup' ? 'Info Kontak' : 'Alamat'} <ChevronRight size={16}/>
            </button>
          </div>
        )}

        {/* ── Step 2: Address / Contact ── */}
        {step === 'address' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} style={{ color: '#1D4ED8' }}/>
              <h2 className="font-semibold" style={{ color: '#0F172A' }}>
                {shippingMethod === 'pickup' ? 'Info Kontak' : 'Alamat Pengiriman'}
              </h2>
            </div>

            {/* Pickup info banner */}
            {shippingMethod === 'pickup' && (
              <div className="rounded-2xl p-4 flex gap-3" style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <Store size={20} style={{ color: '#8B5CF6', flexShrink: 0 }}/>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#7C3AED' }}>Ambil di Toko</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6D28D9' }}>Smash Commerce Store<br/>Jl. Badminton No. 1, Jakarta Selatan<br/>Jam: Sen–Sab 09.00–20.00</p>
                </div>
              </div>
            )}

            <div className="rounded-2xl p-4 space-y-3 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: '#475569' }}>Nama Lengkap</label>
                  <input value={address.name} onChange={set('name')} placeholder="Nama kamu" className={inputClass} style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: '#475569' }}>No. Telepon</label>
                  <input value={address.phone} onChange={set('phone')} placeholder="+62..." className={inputClass} style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
                </div>
              </div>

              {/* Only show full address fields for delivery */}
              {shippingMethod === 'delivery' && (
                <>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: '#475569' }}>Alamat Jalan</label>
                    <input value={address.street} onChange={set('street')} placeholder="Jl. Sudirman No. 45" className={inputClass} style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: '#475569' }}>Kota</label>
                      <input value={address.city} onChange={set('city')} placeholder="Jakarta Selatan" className={inputClass} style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: '#475569' }}>Provinsi</label>
                      <input value={address.province} onChange={set('province')} placeholder="DKI Jakarta" className={inputClass} style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: '#475569' }}>Kode Pos</label>
                    <input value={address.zip} onChange={set('zip')} placeholder="12190" className={inputClass} style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: '#475569' }}>Catatan Pengiriman <span style={{ color: '#94A3B8' }}>(opsional)</span></label>
                    <textarea value={address.notes} onChange={set('notes')} placeholder="Taruh di depan pintu, dll." rows={2} className={`${inputClass} resize-none`} style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('shipping')} className="flex-1 py-3 rounded-2xl text-sm font-medium bg-white" style={{ border: '1px solid #E2E8F0', color: '#94A3B8' }}>Kembali</button>
              <button onClick={() => setStep('payment')} disabled={!canNextAddress}
                className="flex-1 py-3.5 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#1D4ED8,#2563EB)', boxShadow: '0 4px 20px rgba(29,78,216,0.35)' }}>
                Lanjut ke Pembayaran <ChevronRight size={16}/>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Payment ── */}
        {step === 'payment' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={16} style={{ color: '#1D4ED8' }}/>
              <h2 className="font-semibold" style={{ color: '#0F172A' }}>Metode Pembayaran</h2>
            </div>
            <div className="space-y-2.5">
              {PAYMENT_METHODS.map(m => {
                const Icon = m.icon;
                return (
                  <button key={m.id} onClick={() => setPayment(m.id)}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all bg-white"
                    style={{ border: `1px solid ${payment === m.id ? '#1D4ED8' : '#E2E8F0'}`, boxShadow: payment === m.id ? '0 0 0 2px rgba(29,78,216,0.15)' : '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: payment === m.id ? 'rgba(29,78,216,0.1)' : '#F1F5F9' }}>
                      <Icon size={18} style={{ color: payment === m.id ? '#1D4ED8' : '#94A3B8' }}/>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: '#0F172A' }}>{m.label}</p>
                      <p className="text-xs" style={{ color: '#94A3B8' }}>{m.desc}</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: payment === m.id ? '#1D4ED8' : '#E2E8F0' }}>
                      {payment === m.id && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#1D4ED8' }}/>}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('address')} className="flex-1 py-3 rounded-2xl text-sm font-medium bg-white" style={{ border: '1px solid #E2E8F0', color: '#94A3B8' }}>Kembali</button>
              <button onClick={() => setStep('review')} className="flex-1 py-3 rounded-2xl text-white font-semibold text-sm" style={{ background: 'linear-gradient(135deg,#1D4ED8,#2563EB)' }}>Tinjau Pesanan</button>
            </div>
          </div>
        )}

        {/* ── Step 4: Review ── */}
        {step === 'review' && (
          <div className="space-y-4">
            {/* Items */}
            <div className="rounded-2xl p-4 space-y-3 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <h3 className="font-semibold text-sm" style={{ color: '#0F172A' }}>Item Pesanan ({state.cart.length})</h3>
              {state.cart.map(item => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <img src={item.product.image} alt="" className="w-12 h-12 rounded-lg object-cover"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-1" style={{ color: '#0F172A' }}>{item.product.name}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>Jml: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>{formatCurrency(item.product.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            {/* Shipping info */}
            <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              {React.createElement(selectedShipping.icon, { size: 14, style: { color: selectedShipping.color, display: 'inline', marginRight: '6px' } })}
              <span className="font-semibold text-sm" style={{ color: '#0F172A' }}>
                {selectedShipping.label}
              </span>
              {shippingMethod === 'pickup' ? (
                <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>📍 Smash Commerce Store · {address.name} · {address.phone}</p>
              ) : (
                <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>{address.name} · {address.phone} — {address.street}, {address.city}, {address.province} {address.zip}</p>
              )}
            </div>

            {/* Payment */}
            <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center gap-2 mb-1">
                <CreditCard size={14} style={{ color: '#1D4ED8' }}/>
                <h3 className="font-semibold text-sm" style={{ color: '#0F172A' }}>Pembayaran</h3>
              </div>
              <p className="text-sm" style={{ color: '#0F172A' }}>{PAYMENT_METHODS.find(m => m.id === payment)?.label}</p>
            </div>

            {/* Summary */}
            <div className="rounded-2xl p-4 space-y-2 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <h3 className="font-semibold text-sm mb-3" style={{ color: '#0F172A' }}>Ringkasan Pembayaran</h3>
              {[
                ['Subtotal', formatCurrency(cartTotal)],
                ['Ongkos Kirim', shipping === 0 ? 'Gratis 🎉' : formatCurrency(shipping)],
                ...(discount > 0 ? [['Diskon (5%)', `-${formatCurrency(discount)}`]] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span style={{ color: '#94A3B8' }}>{k}</span>
                  <span style={{ color: k === 'Diskon (5%)' ? '#10B981' : k === 'Ongkos Kirim' && shipping === 0 ? '#10B981' : '#0F172A' }}>{v}</span>
                </div>
              ))}
              <div className="pt-2.5 border-t flex justify-between" style={{ borderColor: '#F1F5F9' }}>
                <span className="font-semibold" style={{ color: '#0F172A' }}>Total Pembayaran</span>
                <span className="font-bold text-lg" style={{ color: '#1D4ED8' }}>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('payment')} className="flex-1 py-3 rounded-2xl text-sm font-medium bg-white" style={{ border: '1px solid #E2E8F0', color: '#94A3B8' }}>Kembali</button>
              <button onClick={handlePlaceOrder} disabled={loading}
                className="flex-1 py-3 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2"
                style={{ background: loading ? '#CBD5E1' : 'linear-gradient(135deg,#1D4ED8,#2563EB)', boxShadow: loading ? 'none' : '0 4px 15px rgba(29,78,216,0.35)' }}>
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : 'Buat Pesanan'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

