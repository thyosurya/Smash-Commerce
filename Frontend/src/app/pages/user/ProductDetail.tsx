import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Star, Heart, ShoppingCart, Minus, Plus, Check, ChevronDown, ChevronUp, Zap, Shield, Truck } from 'lucide-react';
import { formatCurrency, type Product } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';
import { fetchProductById } from '../../services/productApi';

const STRING_TYPES = ['Yonex BG80', 'Yonex BG65', 'Yonex Nanogy 99', 'Li-Ning No.1', 'Victor VBS-70'];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, clearCart, state } = useApp();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      return;
    }

    let isMounted = true;

    const loadProduct = async () => {
      try {
        const remoteProduct = await fetchProductById(id);

        if (isMounted) {
          setProduct(remoteProduct);
        }
      } catch {
        if (isMounted) {
          setProduct(undefined);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [stringType, setStringType] = useState(STRING_TYPES[0]);
  const [tension, setTension] = useState(24);
  const [showSpecs, setShowSpecs] = useState(false);
  const [showDesc, setShowDesc] = useState(true);
  const [added, setAdded] = useState(false);

  const isInCart = state.cart.some((item) => item.product.id === product?.id);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F0F4FF' }}>
      <div className="text-center">
        <p className="text-lg mb-3" style={{ color: '#0F172A' }}>Memuat produk...</p>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F0F4FF' }}>
      <div className="text-center">
        <p className="text-lg mb-3" style={{ color: '#0F172A' }}>Produk tidak ditemukan</p>
        <button onClick={() => navigate('/')} className="text-sm px-4 py-2 rounded-xl text-white" style={{ background: '#1D4ED8' }}>Kembali ke Beranda</button>
      </div>
    </div>
  );

  const images = [product.image, product.image, product.image];
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    if (!state.isAuthenticated) {
      toast.error('Silakan login terlebih dahulu.');
      navigate('/login');
      return;
    }
    addToCart(product, qty, product.stringable ? { stringType, tension } : undefined);
    setAdded(true);
    toast.success(`${product.name} added to cart! 🛒`);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleLoveAddToCart = () => {
    if (!state.isAuthenticated) {
      toast.error('Silakan login terlebih dahulu.');
      navigate('/login');
      return;
    }
    addToCart(product, 1, product.stringable ? { stringType, tension } : undefined);
    toast.success(`${product.name} disimpan ke cart.`);
  };

  const handleBuyNow = () => {
    if (!state.isAuthenticated) {
      toast.error('Silakan login terlebih dahulu.');
      navigate('/login');
      return;
    }
    clearCart();
    addToCart(product, qty, product.stringable ? { stringType, tension } : undefined);
    toast.success('Lanjut ke checkout.');
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen" style={{ background: '#F0F4FF', fontFamily: "'Poppins', sans-serif" }}>
      {/* Image Header */}
      <div className="relative" style={{ background: '#1E3A8A' }}>
        <img src={images[activeImg]} alt={product.name} className="w-full object-cover" style={{ height: '300px' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(15,23,42,0.25) 0%, rgba(15,23,42,0.5) 100%)' }} />

        {/* Back + Wishlist */}
        <div className="absolute top-12 left-0 right-0 flex items-center justify-between px-4">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm"
            style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}>
            <ArrowLeft size={18} className="text-white" />
          </button>
          <button onClick={handleLoveAddToCart}
            className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm"
            style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}>
            <Heart size={18} fill={isInCart ? '#EF4444' : 'none'} style={{ color: isInCart ? '#EF4444' : 'white' }} />
          </button>
        </div>

        {/* Badges */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 flex gap-2">
          {product.badge && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
              style={{ background: '#1D4ED8' }}>{product.badge}</span>
          )}
          {discount > 0 && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: '#EF4444' }}>
              -{discount}%
            </span>
          )}
        </div>

        {/* Thumbnail strip */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActiveImg(i)}
              className="rounded-lg overflow-hidden transition-all"
              style={{ width: '44px', height: '44px', border: i === activeImg ? '2px solid #0EA5E9' : '2px solid transparent', opacity: i === activeImg ? 1 : 0.6 }}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(14,165,233,0.1)', color: '#0EA5E9' }}>
              {product.brand}
            </span>
            <span className="text-xs" style={{ color: product.stock > 10 ? '#10B981' : product.stock > 0 ? '#F59E0B' : '#EF4444' }}>
              {product.stock > 10 ? '✓ Stok Tersedia' : product.stock > 0 ? `Sisa ${product.stock}` : 'Habis'}
            </span>
          </div>
          <h1 className="font-bold text-xl mt-1.5 leading-tight" style={{ color: '#0F172A' }}>{product.name}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={13} fill={s <= Math.floor(product.rating) ? '#F59E0B' : 'none'} style={{ color: '#F59E0B' }} />
              ))}
            </div>
            <span className="text-sm font-medium" style={{ color: '#0F172A' }}>{product.rating}</span>
            <span className="text-xs" style={{ color: '#94A3B8' }}>({product.reviewCount} ulasan)</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="font-bold text-2xl" style={{ color: '#1D4ED8' }}>{formatCurrency(product.price)}</p>
            {product.originalPrice && (
              <p className="text-sm line-through" style={{ color: '#CBD5E1' }}>{formatCurrency(product.originalPrice)}</p>
            )}
          </div>
        </div>

        {/* Customization (for stringable products) */}
        {product.stringable && (
          <div className="rounded-2xl p-4 space-y-4 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div className="flex items-center gap-2">
              <Zap size={14} style={{ color: '#1D4ED8' }} />
              <h3 className="font-semibold text-sm" style={{ color: '#0F172A' }}>Opsi Senar</h3>
            </div>

            {/* String Type */}
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: '#475569' }}>Jenis Senar</label>
              <div className="flex flex-wrap gap-2">
                {STRING_TYPES.map(s => (
                  <button key={s} onClick={() => setStringType(s)}
                    className="text-xs px-3 py-1.5 rounded-full transition-all"
                    style={{
                      background: stringType === s ? '#1D4ED8' : '#F1F5F9',
                      border: `1px solid ${stringType === s ? '#1D4ED8' : '#E2E8F0'}`,
                      color: stringType === s ? 'white' : '#475569',
                    }}>
                    {s.split(' ').slice(1).join(' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Tension */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium" style={{ color: '#475569' }}>Tegangan (Tension)</label>
                <span className="text-sm font-bold" style={{ color: '#1D4ED8' }}>{tension} lbs</span>
              </div>
              <input type="range" min={19} max={30} value={tension} onChange={e => setTension(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, #1D4ED8 ${((tension - 19) / 11) * 100}%, #E2E8F0 ${((tension - 19) / 11) * 100}%)` }} />
              <div className="flex justify-between text-[10px] mt-1" style={{ color: '#94A3B8' }}>
                <span>19 lbs (Lembut)</span><span>24 lbs (Standar)</span><span>30 lbs (Pro)</span>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <h3 className="font-semibold text-sm mb-3" style={{ color: '#0F172A' }}>Fitur Utama</h3>
          <div className="space-y-2">
            {product.features.map(f => (
              <div key={f} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(29,78,216,0.1)' }}>
                  <Check size={11} style={{ color: '#1D4ED8' }} />
                </div>
                <span className="text-xs" style={{ color: '#475569' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <button className="w-full flex items-center justify-between p-4" onClick={() => setShowDesc(!showDesc)}>
            <h3 className="font-semibold text-sm" style={{ color: '#0F172A' }}>Deskripsi</h3>
            {showDesc ? <ChevronUp size={16} style={{ color: '#94A3B8' }} /> : <ChevronDown size={16} style={{ color: '#94A3B8' }} />}
          </button>
          {showDesc && <p className="px-4 pb-4 text-xs leading-relaxed" style={{ color: '#475569' }}>{product.description}</p>}
        </div>

        {/* Specs */}
        <div className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <button className="w-full flex items-center justify-between p-4" onClick={() => setShowSpecs(!showSpecs)}>
            <h3 className="font-semibold text-sm" style={{ color: '#0F172A' }}>Spesifikasi</h3>
            {showSpecs ? <ChevronUp size={16} style={{ color: '#94A3B8' }} /> : <ChevronDown size={16} style={{ color: '#94A3B8' }} />}
          </button>
          {showSpecs && (
            <div className="px-4 pb-4 space-y-2">
              {Object.entries(product.specs).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: '#F1F5F9' }}>
                  <span className="text-xs" style={{ color: '#94A3B8' }}>{k}</span>
                  <span className="text-xs font-medium" style={{ color: '#0F172A' }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Shield, label: 'Produk\nResmi', color: '#10B981' },
            { icon: Truck, label: 'Pengiriman\nCepat', color: '#0EA5E9' },
            { icon: Zap, label: 'Pembayaran\nAman', color: '#F59E0B' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <Icon size={16} style={{ color }} />
              <span className="text-[10px] text-center whitespace-pre-line" style={{ color: '#94A3B8' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Reviews */}
        <div>
          <h3 className="font-semibold mb-3" style={{ color: '#0F172A' }}>Ulasan Pelanggan</h3>
          <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <p className="text-xs" style={{ color: '#94A3B8' }}>
              Review detail belum tersedia dari API. Total review saat ini: {product.reviewCount.toLocaleString('id-ID')}.
            </p>
          </div>
        </div>

        {/* Spacer for sticky footer */}
        <div className="h-20" />
      </div>

      {/* Sticky Add to Cart */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-40" style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', boxShadow: '0 -2px 12px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-3">
          {/* Qty control */}
          <div className="flex items-center gap-0 rounded-xl overflow-hidden" style={{ background: '#F1F5F9', border: '1px solid #E2E8F0' }}>
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-10 flex items-center justify-center" style={{ color: '#475569' }}>
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm font-semibold" style={{ color: '#0F172A' }}>{qty}</span>
            <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-9 h-10 flex items-center justify-center" style={{ color: '#475569' }}>
              <Plus size={14} />
            </button>
          </div>

          {/* Add to Cart */}
          <button onClick={handleAddToCart} disabled={product.stock === 0}
            className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            style={{ background: added ? '#10B981' : '#F0F4FF', border: `1px solid ${added ? '#10B981' : '#1D4ED8'}`, color: added ? 'white' : '#1D4ED8' }}>
            {added ? <><Check size={16} />Ditambahkan!</> : <><ShoppingCart size={16} />Tambah ke Keranjang</>}
          </button>

          {/* Beli Sekarang */}
          <button onClick={handleBuyNow} disabled={product.stock === 0}
            className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', boxShadow: '0 4px 15px rgba(29,78,216,0.35)' }}>
            Beli Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
