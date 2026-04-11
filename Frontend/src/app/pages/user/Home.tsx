import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, ChevronRight, Star, Tag, Zap, Award, ShoppingBag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, IMG, type Category, type Product } from '../../data/mockData';
import { fetchProducts } from '../../services/productApi';
import { toast } from 'sonner';

const CATEGORIES: { id: Category; label: string; icon: string; color: string }[] = [
  { id: 'racket', label: 'Racket', icon: '🏸', color: '#2563EB' },
  { id: 'shoes', label: 'Shoes', icon: '👟', color: '#8B5CF6' },
  { id: 'shuttlecock', label: 'Shuttle', icon: '🪶', color: '#0EA5E9' },
  { id: 'string', label: 'String', icon: '🎯', color: '#10B981' },
  { id: 'bag', label: 'Bag', icon: '🎒', color: '#F59E0B' },
  { id: 'jersey', label: 'Jersey', icon: '👕', color: '#EF4444' },
];

const BANNERS = [
  {
    id: 1, title: 'New Season\nCollection', subtitle: 'Up to 30% OFF on all rackets', cta: 'Shop Now',
    bg: 'linear-gradient(135deg, #0F1F3D 0%, #1D4ED8 60%, #0EA5E9 100%)',
    image: IMG.action, tag: 'LIMITED TIME',
  },
  {
    id: 2, title: 'Pro Player\nBundle', subtitle: 'Racket + Shoes + Bag combo deal', cta: 'Get Bundle',
    bg: 'linear-gradient(135deg, #0F1F3D 0%, #6D28D9 60%, #8B5CF6 100%)',
    image: IMG.court, tag: 'BUNDLE DEAL',
  },
];

function ProductCard({
  product,
  onClick,
  onBuyNow,
}: {
  product: Product;
  onClick: () => void;
  onBuyNow: (product: Product) => void;
}) {
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div onClick={onClick}
      className="rounded-2xl overflow-hidden cursor-pointer transition-transform active:scale-95"
      style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', minWidth: '155px', maxWidth: '155px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="relative">
        <img src={product.image} alt={product.name} className="w-full h-32 object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.12) 100%)' }} />
        {product.badge && (
          <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
            style={{ background: product.badge === 'New' || product.isNew ? '#8B5CF6' : '#1D4ED8' }}>
            {product.badge || 'NEW'}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: '#EF4444', color: 'white' }}>
            -{discount}%
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-[10px] font-medium mb-0.5" style={{ color: '#0EA5E9' }}>{product.brand}</p>
        <p className="text-xs font-semibold leading-tight line-clamp-2 mb-1.5" style={{ color: '#0F172A' }}>{product.name}</p>
        <div className="flex items-center gap-1 mb-2">
          <Star size={10} fill="#F59E0B" style={{ color: '#F59E0B' }} />
          <span className="text-[10px]" style={{ color: '#94A3B8' }}>{product.rating} ({product.reviewCount})</span>
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: '#0F172A' }}>{formatCurrency(product.price)}</p>
          {product.originalPrice && (
            <p className="text-[10px] line-through" style={{ color: '#CBD5E1' }}>{formatCurrency(product.originalPrice)}</p>
          )}
        </div>
        <button
          className="mt-2 w-full py-1.5 rounded-lg text-[11px] font-semibold text-white flex items-center justify-center gap-1"
          style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)' }}
          onClick={(event) => {
            event.stopPropagation();
            onBuyNow(product);
          }}
        >
          <ShoppingBag size={11} /> Beli Sekarang
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const { state, addToCart, clearCart } = useApp();
  const navigate = useNavigate();
  const [activeBanner, setActiveBanner] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const remoteProducts = await fetchProducts();

        if (isMounted) {
          setProducts(remoteProducts);
        }
      } catch {
        if (isMounted) {
          setProducts([]);
        }
      }
    };

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const featured = products.filter(p => p.isBestSeller || p.badge).slice(0, 8);
  const newArrivals = products.filter(p => p.isNew).slice(0, 6);
  const filtered = activeCategory === 'all' ? products : products.filter(p => p.category === activeCategory);
  const searched = searchQuery ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase())) : null;

  const handleBuyNow = (product: Product) => {
    clearCart();
    addToCart(product, 1, product.stringable ? { stringType: 'Yonex BG80', tension: 24 } : undefined);
    toast.success(`${product.name} siap untuk checkout.`);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen" style={{ background: '#F0F4FF' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 pt-10 pb-3" style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <Zap size={14} style={{ color: '#1D4ED8' }} />
              <span className="text-xs font-medium" style={{ color: '#1D4ED8' }}>Smash Commerce</span>
            </div>
            <h1 className="font-bold text-lg leading-tight" style={{ color: '#0F172A' }}>
              Hey, {state.user?.name?.split(' ')[0]} 👋
            </h1>
          </div>
          <button onClick={() => navigate('/profile')} className="px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ background: '#F0F4FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
            {state.user?.name || 'Profile'}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
          <input
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search rackets, shoes, shuttles..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#0F172A' }} />
        </div>
      </div>

      <div className="px-4 space-y-6 pb-4 pt-4">
        {/* Search results */}
        {searched && (
          <div>
            <p className="text-sm mb-3" style={{ color: '#94A3B8' }}>{searched.length} results for "{searchQuery}"</p>
            <div className="grid grid-cols-2 gap-3">
              {searched.map(p => (
                <div key={p.id} onClick={() => navigate(`/product/${p.id}`)}
                  className="rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
                  style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <img src={p.image} alt={p.name} className="w-full h-28 object-cover" />
                  <div className="p-2.5">
                    <p className="text-xs font-semibold line-clamp-1" style={{ color: '#0F172A' }}>{p.name}</p>
                    <p className="text-sm font-bold mt-1" style={{ color: '#1D4ED8' }}>{formatCurrency(p.price)}</p>
                  </div>
                </div>
              ))}
              {searched.length === 0 && (
                <div className="col-span-2 text-center py-10" style={{ color: '#94A3B8' }}>No products found</div>
              )}
            </div>
          </div>
        )}

        {!searched && (
          <>
            {/* Hero Banner */}
            <div>
              <div className="relative rounded-3xl overflow-hidden" style={{ height: '180px' }}>
                <img src={BANNERS[activeBanner].image} alt="hero" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: BANNERS[activeBanner].bg, opacity: 0.88 }} />
                <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full w-fit"
                    style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                    <Tag size={9} />{BANNERS[activeBanner].tag}
                  </span>
                  <div>
                    <h2 className="text-white font-bold text-xl leading-tight whitespace-pre-line">{BANNERS[activeBanner].title}</h2>
                    <p className="text-sm mt-1 mb-3" style={{ color: 'rgba(255,255,255,0.8)' }}>{BANNERS[activeBanner].subtitle}</p>
                    <button className="flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.18)', color: 'white', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}>
                      {BANNERS[activeBanner].cta} <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
              {/* Banner dots */}
              <div className="flex justify-center gap-1.5 mt-2">
                {BANNERS.map((_, i) => (
                  <button key={i} onClick={() => setActiveBanner(i)}
                    className="rounded-full transition-all"
                    style={{ width: i === activeBanner ? '16px' : '6px', height: '6px', background: i === activeBanner ? '#1D4ED8' : '#CBD5E1' }} />
                ))}
              </div>
            </div>

            {/* Stats Strip */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Award, label: 'Top Brands', value: '25+', color: '#2563EB' },
                { icon: Tag, label: 'Products', value: '500+', color: '#0EA5E9' },
                { icon: Star, label: 'Happy Players', value: '10K+', color: '#F59E0B' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="rounded-2xl p-3 text-center" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <Icon size={16} style={{ color }} className="mx-auto mb-1" />
                  <p className="font-bold text-sm" style={{ color: '#0F172A' }}>{value}</p>
                  <p className="text-[10px]" style={{ color: '#94A3B8' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold" style={{ color: '#0F172A' }}>Categories</h2>
                <button className="text-xs font-medium" style={{ color: '#1D4ED8' }}>See All</button>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => { setActiveCategory(cat.id); }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all active:scale-95"
                    style={{ background: activeCategory === cat.id ? `${cat.color}10` : '#FFFFFF', border: `1px solid ${activeCategory === cat.id ? cat.color : '#E2E8F0'}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: `${cat.color}12` }}>
                      {cat.icon}
                    </div>
                    <span className="text-xs font-medium" style={{ color: activeCategory === cat.id ? cat.color : '#475569' }}>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter View */}
            {activeCategory !== 'all' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold" style={{ color: '#0F172A' }}>{CATEGORIES.find(c => c.id === activeCategory)?.label}</h2>
                  <button onClick={() => setActiveCategory('all')} className="text-xs font-medium" style={{ color: '#1D4ED8' }}>Clear</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {filtered.map(p => (
                    <div key={p.id} onClick={() => navigate(`/product/${p.id}`)}
                      className="rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
                      style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                      <img src={p.image} alt={p.name} className="w-full h-28 object-cover" />
                      <div className="p-3">
                        <p className="text-[10px]" style={{ color: '#0EA5E9' }}>{p.brand}</p>
                        <p className="text-xs font-semibold line-clamp-2 my-0.5" style={{ color: '#0F172A' }}>{p.name}</p>
                        <div className="flex items-center gap-1 mb-1">
                          <Star size={9} fill="#F59E0B" style={{ color: '#F59E0B' }} />
                          <span className="text-[10px]" style={{ color: '#94A3B8' }}>{p.rating}</span>
                        </div>
                        <p className="font-bold text-sm" style={{ color: '#0F172A' }}>{formatCurrency(p.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Featured Products */}
            {activeCategory === 'all' && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold" style={{ color: '#0F172A' }}>🔥 Best Sellers</h2>
                    <button className="text-xs font-medium" style={{ color: '#1D4ED8' }}>See All</button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
                    {featured.map(p => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onClick={() => navigate(`/product/${p.id}`)}
                        onBuyNow={handleBuyNow}
                      />
                    ))}
                  </div>
                </div>

                {/* New Arrivals */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold" style={{ color: '#0F172A' }}>✨ New Arrivals</h2>
                    <button className="text-xs font-medium" style={{ color: '#1D4ED8' }}>See All</button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
                    {newArrivals.map(p => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onClick={() => navigate(`/product/${p.id}`)}
                        onBuyNow={handleBuyNow}
                      />
                    ))}
                  </div>
                </div>

                {/* Promo Banner
                <div className="rounded-3xl p-5 relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #0EA5E9 100%)' }}>
                  <div className="absolute right-0 top-0 text-8xl opacity-10 select-none">🏸</div>
                  <div className="relative z-10">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white mb-2 inline-block">EXCLUSIVE</span>
                    <h3 className="text-white font-bold text-lg">Free Stringing Service</h3>
                    <p className="text-white/80 text-sm mt-0.5 mb-3">On any racket purchase above Rp 2.000.000</p>
                    <button onClick={() => navigate('/product/r001')}
                      className="flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-xl bg-white"
                      style={{ color: '#1D4ED8' }}>
                      Claim Now <ChevronRight size={14} />
                    </button>
                  </div>
                </div> */}

                {/* Recommended */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold" style={{ color: '#0F172A' }}>💡 Recommended for You</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {products.slice(0, 6).map(p => (
                      <div key={p.id} onClick={() => navigate(`/product/${p.id}`)}
                        className="rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
                        style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                        <img src={p.image} alt={p.name} className="w-full h-28 object-cover" />
                        <div className="p-3">
                          <p className="text-[10px] mb-0.5" style={{ color: '#0EA5E9' }}>{p.brand}</p>
                          <p className="text-xs font-semibold line-clamp-2" style={{ color: '#0F172A' }}>{p.name}</p>
                          <div className="flex items-center gap-1 my-1">
                            <Star size={9} fill="#F59E0B" style={{ color: '#F59E0B' }} />
                            <span className="text-[10px]" style={{ color: '#94A3B8' }}>{p.rating} ({p.reviewCount})</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-sm" style={{ color: '#0F172A' }}>{formatCurrency(p.price)}</p>
                            {p.originalPrice && (
                              <p className="text-[10px] line-through" style={{ color: '#CBD5E1' }}>
                                {formatCurrency(p.originalPrice)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
