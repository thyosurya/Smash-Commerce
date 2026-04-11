import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, CreditCard, ChevronRight, CheckCircle, Building2, Wallet } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../data/mockData';
import { earnPointsApi } from '../../services/pointApi';
import { createOrderApi } from '../../services/orderApi';
import { toast } from 'sonner';

const PAYMENT_METHODS = [
  { id: 'transfer', label: 'Bank Transfer', icon: Building2, desc: 'BCA, Mandiri, BNI, BRI' },
  { id: 'gopay', label: 'GoPay', icon: Wallet, desc: 'Instant payment' },
  { id: 'ovo', label: 'OVO', icon: Wallet, desc: 'Instant payment' },
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, JCB' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { state, cartTotal, clearCart, dispatch } = useApp();
  const [step, setStep] = useState<'address' | 'payment' | 'review'>('address');
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    name: state.user?.name || '', phone: state.user?.phone || '',
    street: '', city: '', province: '', zip: '', notes: '',
  });
  const [payment, setPayment] = useState('transfer');

  const shipping = 25000;
  const discount = cartTotal > 2000000 ? Math.round(cartTotal * 0.05) : 0;
  const total = cartTotal + shipping - discount;

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setAddress(a => ({ ...a, [k]: e.target.value }));

  const handlePlaceOrder = async () => {
    if (state.cart.length === 0) {
      toast.error('Keranjang kosong. Silakan pilih produk dulu.');
      return;
    }

    setLoading(true);

    try {
      const placedOrder = await createOrderApi({
        items: state.cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          customization: item.customization,
        })),
        address: `${address.street}, ${address.city}, ${address.province} ${address.zip}`,
        paymentMethod: PAYMENT_METHODS.find((m) => m.id === payment)?.label || payment,
        shipping,
        discount,
      });

      clearCart();

      let earnedPoints = 0;
      let currentPoints = state.user?.points ?? 0;

      try {
        const pointResult = await earnPointsApi({
          totalAmount: placedOrder.total,
          source: 'purchase',
          reference: placedOrder.id,
          note: 'Point dari checkout user.',
          meta: {
            paymentMethod: placedOrder.paymentMethod,
          },
        });

        earnedPoints = pointResult.earnedPoints;
        currentPoints = pointResult.currentPoints;
        dispatch({ type: 'UPDATE_USER_POINTS', payload: currentPoints });
      } catch {
        toast.error('Order berhasil, tapi sinkronisasi poin gagal.');
      }

      navigate('/order-success', {
        state: {
          orderId: placedOrder.id,
          total: placedOrder.total,
          earnedPoints,
          currentPoints,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal membuat order. Coba lagi.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 'address', label: 'Address' },
    { id: 'payment', label: 'Payment' },
    { id: 'review', label: 'Review' },
  ];
  const stepIdx = steps.findIndex(s => s.id === step);

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl text-sm outline-none";
  const inputStyle = { background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#0F172A' };
  const focusIn = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => e.currentTarget.style.borderColor = '#1D4ED8';
  const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => e.currentTarget.style.borderColor = '#E2E8F0';

  return (
    <div className="min-h-screen" style={{ background: '#F0F4FF', fontFamily: "'Poppins', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 pt-10 pb-4" style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/cart')} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#F1F5F9', border: '1px solid #E2E8F0' }}>
            <ArrowLeft size={18} style={{ color: '#0F172A' }} />
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
                  {i < stepIdx ? <CheckCircle size={12} /> : i + 1}
                </div>
                <span className="text-xs" style={{ color: i === stepIdx ? '#1D4ED8' : i < stepIdx ? '#10B981' : '#94A3B8' }}>{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className="flex-1 h-px mx-1" style={{ background: i < stepIdx ? '#10B981' : '#E2E8F0', width: '24px' }} />}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Step: Address */}
        {step === 'address' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} style={{ color: '#1D4ED8' }} />
              <h2 className="font-semibold" style={{ color: '#0F172A' }}>Delivery Address</h2>
            </div>

            <div className="rounded-2xl p-4 space-y-3 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: '#475569' }}>Full Name</label>
                  <input value={address.name} onChange={set('name')} placeholder="Your name" className={inputClass} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: '#475569' }}>Phone</label>
                  <input value={address.phone} onChange={set('phone')} placeholder="+62..." className={inputClass} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                </div>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#475569' }}>Street Address</label>
                <input value={address.street} onChange={set('street')} placeholder="Jl. Sudirman No. 45" className={inputClass} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: '#475569' }}>City</label>
                  <input value={address.city} onChange={set('city')} placeholder="Jakarta Selatan" className={inputClass} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: '#475569' }}>Province</label>
                  <input value={address.province} onChange={set('province')} placeholder="DKI Jakarta" className={inputClass} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                </div>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#475569' }}>ZIP Code</label>
                <input value={address.zip} onChange={set('zip')} placeholder="12190" className={inputClass} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#475569' }}>Delivery Notes (optional)</label>
                <textarea value={address.notes} onChange={set('notes')} placeholder="Leave at front door, etc."
                  rows={2} className={`${inputClass} resize-none`} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </div>
            </div>

            <button onClick={() => setStep('payment')} disabled={!address.name || !address.street || !address.city}
              className="w-full py-3.5 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', boxShadow: '0 4px 20px rgba(29,78,216,0.35)' }}>
              Continue to Payment <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Step: Payment */}
        {step === 'payment' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={16} style={{ color: '#1D4ED8' }} />
              <h2 className="font-semibold" style={{ color: '#0F172A' }}>Payment Method</h2>
            </div>
            <div className="space-y-2.5">
              {PAYMENT_METHODS.map(m => {
                const Icon = m.icon;
                return (
                  <button key={m.id} onClick={() => setPayment(m.id)}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all bg-white"
                    style={{ border: `1px solid ${payment === m.id ? '#1D4ED8' : '#E2E8F0'}`, boxShadow: payment === m.id ? '0 0 0 2px rgba(29,78,216,0.15)' : '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: payment === m.id ? 'rgba(29,78,216,0.1)' : '#F1F5F9' }}>
                      <Icon size={18} style={{ color: payment === m.id ? '#1D4ED8' : '#94A3B8' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: '#0F172A' }}>{m.label}</p>
                      <p className="text-xs" style={{ color: '#94A3B8' }}>{m.desc}</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: payment === m.id ? '#1D4ED8' : '#E2E8F0' }}>
                      {payment === m.id && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#1D4ED8' }} />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('address')} className="flex-1 py-3 rounded-2xl text-sm font-medium bg-white" style={{ border: '1px solid #E2E8F0', color: '#94A3B8' }}>
                Back
              </button>
              <button onClick={() => setStep('review')} className="flex-1 py-3 rounded-2xl text-white font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)' }}>
                Review Order
              </button>
            </div>
          </div>
        )}

        {/* Step: Review */}
        {step === 'review' && (
          <div className="space-y-4">
            {/* Items */}
            <div className="rounded-2xl p-4 space-y-3 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <h3 className="font-semibold text-sm" style={{ color: '#0F172A' }}>Order Items ({state.cart.length})</h3>
              {state.cart.map(item => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <img src={item.product.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-1" style={{ color: '#0F172A' }}>{item.product.name}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>{formatCurrency(item.product.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            {/* Address */}
            <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={14} style={{ color: '#1D4ED8' }} />
                <h3 className="font-semibold text-sm" style={{ color: '#0F172A' }}>Delivery To</h3>
              </div>
              <p className="text-sm font-medium" style={{ color: '#0F172A' }}>{address.name} · {address.phone}</p>
              <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{address.street}, {address.city}, {address.province} {address.zip}</p>
            </div>

            {/* Payment */}
            <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center gap-2 mb-2">
                <CreditCard size={14} style={{ color: '#1D4ED8' }} />
                <h3 className="font-semibold text-sm" style={{ color: '#0F172A' }}>Payment</h3>
              </div>
              <p className="text-sm" style={{ color: '#0F172A' }}>{PAYMENT_METHODS.find(m => m.id === payment)?.label}</p>
            </div>

            {/* Summary */}
            <div className="rounded-2xl p-4 space-y-2 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <h3 className="font-semibold text-sm mb-3" style={{ color: '#0F172A' }}>Payment Summary</h3>
              {[['Subtotal', formatCurrency(cartTotal)], ['Shipping', formatCurrency(shipping)], ...(discount > 0 ? [['Discount (5%)', `-${formatCurrency(discount)}`]] : [])].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span style={{ color: '#94A3B8' }}>{k}</span>
                  <span style={{ color: k === 'Discount (5%)' ? '#10B981' : '#0F172A' }}>{v}</span>
                </div>
              ))}
              <div className="pt-2.5 border-t flex justify-between" style={{ borderColor: '#F1F5F9' }}>
                <span className="font-semibold" style={{ color: '#0F172A' }}>Total Payment</span>
                <span className="font-bold text-lg" style={{ color: '#1D4ED8' }}>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('payment')} className="flex-1 py-3 rounded-2xl text-sm font-medium bg-white" style={{ border: '1px solid #E2E8F0', color: '#94A3B8' }}>Back</button>
              <button onClick={handlePlaceOrder} disabled={loading} className="flex-1 py-3 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2"
                style={{ background: loading ? '#CBD5E1' : 'linear-gradient(135deg, #1D4ED8, #2563EB)', boxShadow: loading ? 'none' : '0 4px 15px rgba(29,78,216,0.35)' }}>
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Place Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
