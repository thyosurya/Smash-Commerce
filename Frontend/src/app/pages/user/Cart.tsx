import { useNavigate } from 'react-router';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, Tag, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../data/mockData';
import { toast } from 'sonner';

export default function Cart() {
  const navigate = useNavigate();
  const { state, updateQuantity, removeFromCart, cartTotal } = useApp();
  const cart = state.cart;
  const shipping = cart.length > 0 ? 25000 : 0;
  const discount = cartTotal > 2000000 ? Math.round(cartTotal * 0.05) : 0;
  const finalTotal = cartTotal + shipping - discount;

  return (
    <div className="min-h-screen" style={{ background: '#F0F4FF', fontFamily: "'Poppins', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 pt-10 pb-4" style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#F1F5F9', border: '1px solid #E2E8F0' }}>
            <ArrowLeft size={18} style={{ color: '#0F172A' }} />
          </button>
          <h1 className="font-bold text-lg" style={{ color: '#0F172A' }}>My Cart</h1>
          {cart.length > 0 && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full text-white" style={{ background: '#1D4ED8' }}>
              {cart.length} item{cart.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4" style={{ background: '#F1F5F9' }}>
            <ShoppingBag size={40} style={{ color: '#CBD5E1' }} />
          </div>
          <h2 className="font-semibold text-lg mb-1" style={{ color: '#0F172A' }}>Your cart is empty</h2>
          <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>Add some badminton gear to get started</p>
          <button onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium text-sm"
            style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)' }}>
            Start Shopping <ChevronRight size={16} />
          </button>
        </div>
      ) : (
        <div className="p-4">
          {/* Cart Items */}
          <div className="space-y-3 mb-4">
            {cart.map(item => (
              <div key={item.product.id} className="rounded-2xl p-3.5 flex gap-3 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <img src={item.product.image} alt={item.product.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] mb-0.5" style={{ color: '#0EA5E9' }}>{item.product.brand}</p>
                  <p className="text-sm font-semibold line-clamp-2 leading-tight" style={{ color: '#0F172A' }}>{item.product.name}</p>
                  {item.customization && (
                    <p className="text-[10px] mt-0.5" style={{ color: '#94A3B8' }}>
                      {item.customization.stringType && `String: ${item.customization.stringType.split(' ').slice(1).join(' ')}`}
                      {item.customization.tension && ` · ${item.customization.tension} lbs`}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-bold text-sm" style={{ color: '#1D4ED8' }}>{formatCurrency(item.product.price * item.quantity)}</p>
                    <div className="flex items-center gap-1 rounded-lg overflow-hidden" style={{ background: '#F1F5F9', border: '1px solid #E2E8F0' }}>
                      <button onClick={() => {
                        if (item.quantity === 1) {
                          removeFromCart(item.product.id);
                          toast.success('Item removed');
                        } else updateQuantity(item.product.id, item.quantity - 1);
                      }} className="w-7 h-7 flex items-center justify-center" style={{ color: '#475569' }}>
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-xs font-semibold" style={{ color: '#0F172A' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center" style={{ color: '#475569' }}>
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
                <button onClick={() => { removeFromCart(item.product.id); toast.success('Item removed'); }}
                  className="self-start p-1.5 rounded-lg shrink-0" style={{ background: 'rgba(239,68,68,0.08)' }}>
                  <Trash2 size={14} style={{ color: '#EF4444' }} />
                </button>
              </div>
            ))}
          </div>

          {/* Promo Code */}
          <div className="rounded-2xl p-4 mb-4 flex items-center gap-3 bg-white" style={{ border: '1px dashed #CBD5E1' }}>
            <Tag size={16} style={{ color: '#1D4ED8' }} />
            <input placeholder="Enter promo code" className="flex-1 bg-transparent text-sm outline-none" style={{ color: '#0F172A' }} />
            <button className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{ background: '#1D4ED8' }}>Apply</button>
          </div>

          {/* Order Summary */}
          <div className="rounded-2xl p-4 mb-4 space-y-2.5 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <h3 className="font-semibold text-sm mb-3" style={{ color: '#0F172A' }}>Order Summary</h3>
            <div className="flex justify-between text-sm">
              <span style={{ color: '#94A3B8' }}>Subtotal ({cart.length} items)</span>
              <span style={{ color: '#0F172A' }}>{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: '#94A3B8' }}>Shipping</span>
              <span style={{ color: '#0F172A' }}>{formatCurrency(shipping)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span style={{ color: '#10B981' }}>Loyalty Discount (5%)</span>
                <span style={{ color: '#10B981' }}>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="pt-2 border-t flex justify-between" style={{ borderColor: '#F1F5F9' }}>
              <span className="font-semibold" style={{ color: '#0F172A' }}>Total</span>
              <span className="font-bold text-lg" style={{ color: '#1D4ED8' }}>{formatCurrency(finalTotal)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button onClick={() => navigate('/checkout')}
            className="w-full py-3.5 rounded-2xl text-white font-semibold flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', boxShadow: '0 4px 20px rgba(29,78,216,0.35)' }}>
            Proceed to Checkout <ChevronRight size={16} />
          </button>

          <button onClick={() => navigate('/')} className="w-full py-2.5 mt-2 rounded-2xl text-sm text-center" style={{ color: '#94A3B8' }}>
            Continue Shopping
          </button>
        </div>
      )}
    </div>
  );
}
