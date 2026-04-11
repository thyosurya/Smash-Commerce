import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { CheckCircle, Package, ChevronRight, Star, Home } from 'lucide-react';
import { formatCurrency } from '../../data/mockData';
// import confetti from 'canvas-confetti';

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, total, earnedPoints, currentPoints } = (location.state as {
    orderId: string;
    total: number;
    earnedPoints?: number;
    currentPoints?: number;
  }) || { orderId: 'ORD-2026-999', total: 0 };

  // useEffect(() => {
  //   confetti({ particleCount: 120, spread: 70, origin: { y: 0.5 }, colors: ['#1D4ED8', '#0EA5E9', '#F59E0B', '#10B981'] });
  //   setTimeout(() => confetti({ particleCount: 60, spread: 55, origin: { y: 0.4 }, colors: ['#1D4ED8', '#8B5CF6'] }), 600);
  // }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: '#F0F4FF', fontFamily: "'Poppins', sans-serif" }}>
      {/* BG glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)' }} />
      </div>

      <div className="relative">
        {/* Success Icon */}
        <div className="w-28 h-28 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.04) 100%)', border: '2px solid rgba(16,185,129,0.2)' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
            <CheckCircle size={48} style={{ color: '#10B981' }} />
          </div>
        </div>

        <h1 className="font-bold text-2xl mb-1" style={{ color: '#0F172A' }}>Order Placed! 🎉</h1>
        <p className="mb-1" style={{ color: '#94A3B8' }}>Your badminton gear is on the way</p>
        <p className="text-sm font-medium mb-8" style={{ color: '#1D4ED8' }}>{orderId}</p>

        {/* Order Card */}
        <div className="rounded-3xl p-5 mb-6 text-left w-full max-w-sm mx-auto bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div className="flex justify-between mb-3">
            <span className="text-xs" style={{ color: '#94A3B8' }}>Order ID</span>
            <span className="text-xs font-semibold" style={{ color: '#0F172A' }}>{orderId}</span>
          </div>
          <div className="flex justify-between mb-3">
            <span className="text-xs" style={{ color: '#94A3B8' }}>Total Amount</span>
            <span className="text-sm font-bold" style={{ color: '#1D4ED8' }}>{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between mb-3">
            <span className="text-xs" style={{ color: '#94A3B8' }}>Estimated Delivery</span>
            <span className="text-xs font-medium" style={{ color: '#0F172A' }}>2 - 4 Business Days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs" style={{ color: '#94A3B8' }}>Points Earned</span>
            <span className="text-xs font-semibold" style={{ color: '#F59E0B' }}>+{Math.max(earnedPoints ?? 0, 0)} pts ⭐</span>
          </div>

          {typeof currentPoints === 'number' && (
            <div className="flex justify-between mt-1">
              <span className="text-xs" style={{ color: '#94A3B8' }}>Current Balance</span>
              <span className="text-xs font-semibold" style={{ color: '#0F172A' }}>{currentPoints.toLocaleString('id-ID')} pts</span>
            </div>
          )}

          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#F1F5F9' }}>
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(29,78,216,0.06)', border: '1px solid rgba(29,78,216,0.12)' }}>
              <Package size={16} style={{ color: '#1D4ED8' }} />
              <span className="text-xs" style={{ color: '#1D4ED8' }}>Tracking number will be sent to your email</span>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="w-full max-w-sm mx-auto mb-8">
          {[
            { label: 'Order Confirmed', done: true, active: false },
            { label: 'Processing', done: false, active: true },
            { label: 'Shipped', done: false, active: false },
            { label: 'Delivered', done: false, active: false },
          ].map((s, i, arr) => (
            <div key={s.label} className="flex items-start gap-3 mb-3 last:mb-0">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: s.done ? '#10B981' : s.active ? '#1D4ED8' : '#F1F5F9', border: s.active ? '2px solid #93C5FD' : '2px solid transparent' }}>
                  {s.done ? <CheckCircle size={14} className="text-white" /> : <span className="text-xs font-bold" style={{ color: s.active ? 'white' : '#CBD5E1' }}>{i + 1}</span>}
                </div>
                {i < arr.length - 1 && <div className="w-px h-5 mt-0.5" style={{ background: s.done ? '#10B981' : '#E2E8F0' }} />}
              </div>
              <div className="pt-0.5">
                <p className="text-xs font-medium" style={{ color: s.done ? '#10B981' : s.active ? '#0F172A' : '#94A3B8' }}>{s.label}</p>
                {s.active && <p className="text-[10px]" style={{ color: '#94A3B8' }}>Your order is being prepared</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full max-w-sm mx-auto">
          <button onClick={() => navigate('/orders')}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-sm font-medium bg-white"
            style={{ border: '1px solid #E2E8F0', color: '#475569', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <Package size={15} /> Track Order
          </button>
          <button onClick={() => navigate('/')}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-white font-semibold text-sm"
            style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', boxShadow: '0 4px 15px rgba(29,78,216,0.35)' }}>
            <Home size={15} /> Continue <ChevronRight size={14} />
          </button>
        </div>

        {/* Rate prompt */}
        <div className="mt-4 p-3 rounded-2xl flex items-center gap-3 w-full max-w-sm mx-auto bg-white" style={{ border: '1px dashed #CBD5E1' }}>
          <Star size={16} style={{ color: '#F59E0B' }} />
          <p className="text-xs" style={{ color: '#94A3B8' }}>After delivery, rate your experience and earn bonus points!</p>
        </div>
      </div>
    </div>
  );
}
