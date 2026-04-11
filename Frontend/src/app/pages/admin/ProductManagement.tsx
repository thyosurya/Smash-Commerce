import { useEffect, useMemo, useState } from 'react';
import {
  Plus, Search, Edit3, Trash2, Package, AlertTriangle, Check, X,
  LayoutGrid, Store, Star, Tag, ChevronRight, Award, Zap, Eye,
  ShoppingCart, Heart, User, ChevronDown, Shield, Truck, RefreshCw,
  Grid3x3, List, SlidersHorizontal, ArrowRight, Flame, Sparkles,
} from 'lucide-react';
import { formatCurrency, IMG, type Product, type Category } from '../../data/mockData';
import { createAdminProduct, deleteAdminProduct, fetchProducts, updateAdminProduct } from '../../services/productApi';
import { toast } from 'sonner';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES: Category[] = ['racket', 'shoes', 'shuttlecock', 'string', 'bag', 'jersey'];
const CAT_META: { id: Category; label: string; icon: string; color: string }[] = [
  { id: 'racket',      label: 'Racket',      icon: '🏸', color: '#2563EB' },
  { id: 'shoes',       label: 'Shoes',       icon: '👟', color: '#8B5CF6' },
  { id: 'shuttlecock', label: 'Shuttlecock', icon: '🪶', color: '#0EA5E9' },
  { id: 'string',      label: 'String',      icon: '🎯', color: '#10B981' },
  { id: 'bag',         label: 'Bag',         icon: '🎒', color: '#F59E0B' },
  { id: 'jersey',      label: 'Jersey',      icon: '���', color: '#EF4444' },
];
const CATEGORY_COLORS: Record<Category, string> = {
  racket: '#2563EB', shoes: '#8B5CF6', shuttlecock: '#0EA5E9',
  string: '#10B981', bag: '#F59E0B', jersey: '#EF4444',
};

type ProductForm = {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: string;
  originalPrice: string;
  stock: string;
  image: string;
  badge: string;
  rating: string;
  reviewCount: string;
  description: string;
  featuresText: string;
  specsText: string;
  isNew: boolean;
  isBestSeller: boolean;
  stringable: boolean;
};

const createEmptyForm = (): ProductForm => ({
  id: '',
  name: '',
  brand: '',
  category: 'racket',
  price: '',
  originalPrice: '',
  stock: '',
  image: '',
  badge: '',
  rating: '0',
  reviewCount: '0',
  description: '',
  featuresText: '',
  specsText: '',
  isNew: false,
  isBestSeller: false,
  stringable: true,
});

const parseFeaturesText = (text: string): string[] =>
  text
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

const parseSpecsText = (text: string): Record<string, string> => {
  const rows = text
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

  return rows.reduce<Record<string, string>>((acc, row) => {
    const separatorMatch = row.match(/\s*[:=-]\s*/);

    if (separatorMatch) {
      const separator = separatorMatch[0];
      const [key, ...valueParts] = row.split(separator);
      const cleanKey = key?.trim();
      const cleanValue = valueParts.join(separator).trim();

      if (cleanKey && cleanValue) {
        acc[cleanKey] = cleanValue;
      }
    } else {
      // Fallback when user inputs plain text without key/value separator.
      acc[`Detail ${Object.keys(acc).length + 1}`] = row;
    }

    return acc;
  }, {});
};

const formatSpecsToText = (specs: Record<string, string>): string =>
  Object.entries(specs)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

const BANNERS = [
  {
    id: 1, title: 'New Season Collection', subtitle: 'Up to 30% OFF on all rackets — pro gear for every player level.',
    cta: 'Shop Now', bg: 'linear-gradient(120deg, #0F1F3D 0%, #1D4ED8 55%, #0EA5E9 100%)',
    image: IMG.action, tag: 'LIMITED TIME', accent: '#0EA5E9',
  },
  {
    id: 2, title: 'Pro Player Bundle', subtitle: 'Racket + Shoes + Bag combo deal — save up to Rp 500.000.',
    cta: 'Get Bundle', bg: 'linear-gradient(120deg, #0F1F3D 0%, #6D28D9 55%, #8B5CF6 100%)',
    image: IMG.court, tag: 'BUNDLE DEAL', accent: '#8B5CF6',
  },
];

// ─── Desktop Product Card ──────────────────────────────────────────────────────
function DesktopProductCard({ product, onSelect }: { product: Product; onSelect: (p: Product) => void }) {
  const [hovered, setHovered] = useState(false);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(product)}
      className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 group"
      style={{
        background: '#FFFFFF',
        border: `1px solid ${hovered ? '#1D4ED8' : '#E2E8F0'}`,
        boxShadow: hovered ? '0 8px 28px rgba(29,78,216,0.13)' : '0 1px 4px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: '200px' }}>
        <img
          src={product.image} alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300"
          style={{ transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.15) 100%)' }} />
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {product.badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
              style={{ background: product.isNew ? '#8B5CF6' : '#1D4ED8' }}>
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: '#EF4444', color: 'white' }}>
              -{discount}%
            </span>
          )}
        </div>
        {/* Hover actions */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 transition-all duration-200"
          style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateX(0)' : 'translateX(8px)' }}>
          <button className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: '#FFFFFF' }}>
            <Heart size={14} style={{ color: '#EF4444' }} />
          </button>
          <button className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: '#FFFFFF' }}>
            <Eye size={14} style={{ color: '#1D4ED8' }} />
          </button>
        </div>
        {product.stock < 10 && (
          <span className="absolute bottom-2 left-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(245,158,11,0.9)', color: 'white' }}>
            Low Stock
          </span>
        )}
      </div>
      {/* Content */}
      <div className="p-3.5">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] font-semibold" style={{ color: '#0EA5E9' }}>{product.brand}</span>
          <span style={{ color: '#E2E8F0' }}>·</span>
          <span className="text-[10px] capitalize px-1.5 py-0.5 rounded-full"
            style={{ background: `${CATEGORY_COLORS[product.category]}12`, color: CATEGORY_COLORS[product.category] }}>
            {product.category}
          </span>
        </div>
        <p className="text-sm font-semibold line-clamp-2 mb-2 leading-snug" style={{ color: '#0F172A' }}>
          {product.name}
        </p>
        <div className="flex items-center gap-1 mb-2.5">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={10}
                fill={i < Math.floor(product.rating) ? '#F59E0B' : 'transparent'}
                style={{ color: '#F59E0B' }} />
            ))}
          </div>
          <span className="text-[10px]" style={{ color: '#94A3B8' }}>({product.reviewCount})</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="font-bold text-sm" style={{ color: '#0F172A' }}>{formatCurrency(product.price)}</p>
            {product.originalPrice && (
              <p className="text-[10px] line-through" style={{ color: '#CBD5E1' }}>{formatCurrency(product.originalPrice)}</p>
            )}
          </div>
          <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-white transition-colors"
            style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)' }}>
            <ShoppingCart size={11} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Desktop Store Preview ─────────────────────────────────────────────────────
function StorePreview({ products }: { products: Product[] }) {
  const [activeBanner, setActiveBanner] = useState(0);
  const [activeCat, setActiveCat] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [gridView, setGridView] = useState<'grid4' | 'grid3'>('grid4');
  const [wishlist, setWishlist] = useState<string[]>([]);

  const toggleWishlist = (id: string) =>
    setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);

  const bestSellers = products.filter(p => p.isBestSeller || p.badge).slice(0, 8);
  const newArrivals = products.filter(p => p.isNew).slice(0, 8);
  const displayedProducts = activeCat === 'all'
    ? (searchQuery ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
      : products)
    : products.filter(p => p.category === activeCat);

  const gridCols = gridView === 'grid4' ? 'grid-cols-4' : 'grid-cols-3';

  return (
    <div className="space-y-3">
      {/* Preview badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}>
          <Eye size={13} style={{ color: '#2563EB' }} />
          <span className="text-xs font-medium" style={{ color: '#2563EB' }}>Preview Mode — Read Only</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <Store size={12} style={{ color: '#10B981' }} />
          <span className="text-[10px] font-medium" style={{ color: '#10B981' }}>Desktop View</span>
        </div>
      </div>

      {/* Browser Chrome Frame */}
      <div className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid #CBD5E1', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

        {/* Browser titlebar */}
        <div className="flex items-center gap-3 px-4 py-2.5"
          style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#10B981' }} />
          </div>
          <div className="flex-1 flex items-center gap-2 px-3 py-1 rounded-lg max-w-md mx-auto"
            style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Shield size={11} style={{ color: '#10B981' }} />
            <span className="text-xs" style={{ color: '#64748B' }}>smashcommerce.id</span>
          </div>
          <div className="flex items-center gap-2" style={{ color: '#94A3B8' }}>
            <div className="text-xs">↩</div>
            <div className="text-xs">↪</div>
            <div className="text-xs">⟳</div>
          </div>
        </div>

        {/* ── Website Content ── */}
        <div style={{ background: '#F0F4FF', maxHeight: '900px', overflowY: 'auto', scrollbarWidth: 'none' }}>

          {/* Top Announcement Bar */}
          <div className="text-center py-2 text-xs font-medium text-white"
            style={{ background: 'linear-gradient(90deg, #1D4ED8, #0EA5E9, #1D4ED8)', backgroundSize: '200% auto' }}>
            🏸 Free Shipping on orders above Rp 500.000 &nbsp;·&nbsp; Use code <strong>SMASH10</strong> for 10% off your first order
          </div>

          {/* Navbar */}
          <nav className="sticky top-0 z-30 px-8 py-0"
            style={{ background: '#FFFFFF', borderBottom: '1px solid #E8EFFE', boxShadow: '0 1px 8px rgba(29,78,216,0.06)' }}>
            <div className="flex items-center gap-6 max-w-7xl mx-auto" style={{ height: '64px' }}>
              {/* Logo */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #1D4ED8, #0EA5E9)' }}>
                  <Zap size={16} className="text-white" />
                </div>
                <div>
                  <span className="font-bold text-sm" style={{ color: '#0F172A' }}>Smash</span>
                  <span className="font-bold text-sm" style={{ color: '#1D4ED8' }}>Commerce</span>
                </div>
              </div>

              {/* Nav links */}
              <div className="hidden lg:flex items-center gap-1">
                {['Home', 'Rackets', 'Shoes', 'Accessories', 'New Arrivals', 'Sale 🔥'].map(link => (
                  <button key={link} className="flex items-center gap-0.5 px-3 py-2 rounded-lg text-sm transition-colors"
                    style={{ color: link === 'Home' ? '#1D4ED8' : '#475569' }}>
                    {link}
                    {link === 'Rackets' && <ChevronDown size={13} />}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="flex-1 max-w-sm relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
                  style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#0F172A' }}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-auto shrink-0">
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-slate-50"
                  style={{ color: '#475569' }}>
                  <User size={16} />
                  <span className="text-xs">Account</span>
                </button>
                <div className="relative">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-slate-50"
                    style={{ color: '#475569' }}>
                    <ShoppingCart size={16} />
                    <span className="text-xs">Cart</span>
                  </button>
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                    style={{ background: '#EF4444' }}>3</span>
                </div>
              </div>
            </div>

            {/* Category nav pills */}
            <div className="flex items-center gap-1.5 max-w-7xl mx-auto pb-2.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              <button
                onClick={() => setActiveCat('all')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0"
                style={{ background: activeCat === 'all' ? '#1D4ED8' : '#F1F5F9', color: activeCat === 'all' ? 'white' : '#64748B' }}>
                All Products
              </button>
              {CAT_META.map(cat => (
                <button key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0"
                  style={{
                    background: activeCat === cat.id ? CATEGORY_COLORS[cat.id] : '#F1F5F9',
                    color: activeCat === cat.id ? 'white' : '#64748B',
                  }}>
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </nav>

          {/* ── Page Body ── */}
          <div className="max-w-7xl mx-auto px-8 py-6 space-y-10">

            {/* Hero Banner */}
            {activeCat === 'all' && !searchQuery && (
              <div className="grid grid-cols-3 gap-4">
                {/* Main banner */}
                <div className="col-span-2 relative rounded-3xl overflow-hidden" style={{ height: '340px' }}>
                  <img src={BANNERS[activeBanner].image} alt="hero" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: BANNERS[activeBanner].bg, opacity: 0.87 }} />
                  <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-4"
                        style={{ background: 'rgba(255,255,255,0.18)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}>
                        <Tag size={10} /> {BANNERS[activeBanner].tag}
                      </span>
                      <h2 className="text-white font-bold text-4xl leading-tight mb-2">{BANNERS[activeBanner].title}</h2>
                      <p className="text-base mb-6" style={{ color: 'rgba(255,255,255,0.8)' }}>{BANNERS[activeBanner].subtitle}</p>
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
                          style={{ background: 'white', color: '#1D4ED8' }}>
                          {BANNERS[activeBanner].cta} <ArrowRight size={15} />
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white"
                          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}>
                          View All
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {BANNERS.map((_, i) => (
                        <button key={i} onClick={() => setActiveBanner(i)}
                          className="rounded-full transition-all"
                          style={{ width: i === activeBanner ? '24px' : '7px', height: '7px', background: i === activeBanner ? 'white' : 'rgba(255,255,255,0.4)' }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Side cards */}
                <div className="flex flex-col gap-4">
                  <div className="flex-1 relative rounded-2xl overflow-hidden" style={{ minHeight: '160px' }}>
                    <img src={IMG.racket} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(29,78,216,0.82), rgba(14,165,233,0.7))' }} />
                    <div className="relative z-10 p-4 h-full flex flex-col justify-end">
                      <p className="text-[10px] font-bold text-white/70 mb-0.5">FEATURED</p>
                      <p className="text-white font-bold leading-tight">Premium Rackets</p>
                      <p className="text-white/70 text-xs mt-0.5">From Rp 850.000</p>
                    </div>
                  </div>
                  <div className="flex-1 relative rounded-2xl overflow-hidden" style={{ minHeight: '160px' }}>
                    <img src={IMG.shoes} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.82), rgba(139,92,246,0.7))' }} />
                    <div className="relative z-10 p-4 h-full flex flex-col justify-end">
                      <p className="text-[10px] font-bold text-white/70 mb-0.5">HOT</p>
                      <p className="text-white font-bold leading-tight">Court Shoes</p>
                      <p className="text-white/70 text-xs mt-0.5">New Season Drop</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Trust badges */}
            {activeCat === 'all' && !searchQuery && (
              <div className="grid grid-cols-4 gap-4">
                {[
                  { icon: Truck, title: 'Free Shipping', sub: 'On orders over Rp 500K', color: '#2563EB' },
                  { icon: Shield, title: 'Authentic Guarantee', sub: '100% original products', color: '#10B981' },
                  { icon: RefreshCw, title: 'Easy Returns', sub: '30-day return policy', color: '#F59E0B' },
                  { icon: Award, title: 'Top Brands', sub: 'Yonex, Victor, Li-Ning', color: '#8B5CF6' },
                ].map(({ icon: Icon, title, sub, color }) => (
                  <div key={title} className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${color}12` }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold leading-tight" style={{ color: '#0F172A' }}>{title}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#94A3B8' }}>{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Best Sellers Section ── */}
            {activeCat === 'all' && !searchQuery && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(239,68,68,0.1)' }}>
                      <Flame size={16} style={{ color: '#EF4444' }} />
                    </div>
                    <div>
                      <h2 className="font-bold" style={{ color: '#0F172A' }}>Best Sellers</h2>
                      <p className="text-xs" style={{ color: '#94A3B8' }}>Most popular products this week</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 text-sm font-medium" style={{ color: '#1D4ED8' }}>
                    View All <ArrowRight size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {bestSellers.slice(0, 4).map(p => (
                    <DesktopProductCard key={p.id} product={p} onSelect={setPreviewProduct} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Category Showcase (all, no search) ── */}
            {activeCat === 'all' && !searchQuery && (
              <div className="rounded-3xl p-6 overflow-hidden relative"
                style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}>
                <div className="absolute right-0 top-0 text-[200px] opacity-5 select-none leading-none">🏸</div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-xs font-semibold mb-1" style={{ color: '#0EA5E9' }}>BROWSE BY CATEGORY</p>
                      <h2 className="font-bold text-xl text-white">Shop by Sport Category</h2>
                    </div>
                    <button className="flex items-center gap-1.5 text-sm font-medium" style={{ color: '#0EA5E9' }}>
                      All Categories <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-3">
                    {CAT_META.map(cat => (
                      <button key={cat.id} onClick={() => setActiveCat(cat.id)}
                        className="flex flex-col items-center gap-2.5 p-4 rounded-2xl transition-all hover:scale-105"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                          style={{ background: `${cat.color}20` }}>
                          {cat.icon}
                        </div>
                        <span className="text-xs font-medium text-white">{cat.label}</span>
                        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {products.filter(p => p.category === cat.id).length} items
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── New Arrivals ── */}
            {activeCat === 'all' && !searchQuery && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(139,92,246,0.1)' }}>
                      <Sparkles size={16} style={{ color: '#8B5CF6' }} />
                    </div>
                    <div>
                      <h2 className="font-bold" style={{ color: '#0F172A' }}>New Arrivals</h2>
                      <p className="text-xs" style={{ color: '#94A3B8' }}>Fresh drops just landed</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 text-sm font-medium" style={{ color: '#1D4ED8' }}>
                    View All <ArrowRight size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {newArrivals.slice(0, 4).map(p => (
                    <DesktopProductCard key={p.id} product={p} onSelect={setPreviewProduct} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Promo Banner ── */}
            {activeCat === 'all' && !searchQuery && (
              <div className="grid grid-cols-2 gap-4">
                <div className="relative rounded-3xl overflow-hidden p-6" style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #0EA5E9 100%)', minHeight: '140px' }}>
                  <div className="absolute right-4 bottom-0 text-8xl opacity-15 select-none">🏸</div>
                  <div className="relative z-10">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white mb-2 inline-block">EXCLUSIVE OFFER</span>
                    <h3 className="text-white font-bold text-lg mb-1">Free Stringing Service</h3>
                    <p className="text-white/80 text-sm mb-4">On any racket purchase above Rp 2.000.000</p>
                    <button className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-white" style={{ color: '#1D4ED8' }}>
                      Claim Now <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
                <div className="relative rounded-3xl overflow-hidden p-6" style={{ background: 'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)', minHeight: '140px' }}>
                  <div className="absolute right-4 bottom-0 text-8xl opacity-15 select-none">🏆</div>
                  <div className="relative z-10">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white mb-2 inline-block">CRM REWARDS</span>
                    <h3 className="text-white font-bold text-lg mb-1">Earn Points Every Purchase</h3>
                    <p className="text-white/80 text-sm mb-4">Level up: Newbie → Amateur → Pro → Champion</p>
                    <button className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-white" style={{ color: '#6D28D9' }}>
                      Join Now <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Category / Search Results ── */}
            {(activeCat !== 'all' || searchQuery) && (
              <div>
                {/* Section header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-bold" style={{ color: '#0F172A' }}>
                      {searchQuery
                        ? `Results for "${searchQuery}"`
                        : `${CAT_META.find(c => c.id === activeCat)?.icon} ${CAT_META.find(c => c.id === activeCat)?.label}`}
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{displayedProducts.length} products found</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                      <button onClick={() => setGridView('grid4')} className="p-1.5 rounded-lg transition-colors"
                        style={{ background: gridView === 'grid4' ? '#EFF6FF' : 'transparent', color: gridView === 'grid4' ? '#1D4ED8' : '#94A3B8' }}>
                        <Grid3x3 size={14} />
                      </button>
                      <button onClick={() => setGridView('grid3')} className="p-1.5 rounded-lg transition-colors"
                        style={{ background: gridView === 'grid3' ? '#EFF6FF' : 'transparent', color: gridView === 'grid3' ? '#1D4ED8' : '#94A3B8' }}>
                        <List size={14} />
                      </button>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                      style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#475569' }}>
                      <SlidersHorizontal size={13} /> Filter
                    </button>
                  </div>
                </div>

                {/* Product Grid */}
                {displayedProducts.length > 0 ? (
                  <div className={`grid ${gridCols} gap-4`}>
                    {displayedProducts.map(p => (
                      <DesktopProductCard key={p.id} product={p} onSelect={setPreviewProduct} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                    <Package size={40} style={{ color: '#CBD5E1' }} className="mx-auto mb-3" />
                    <p className="font-semibold" style={{ color: '#0F172A' }}>No products found</p>
                    <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Try a different search or category</p>
                    <button onClick={() => { setSearchQuery(''); setActiveCat('all'); }}
                      className="mt-4 px-4 py-2 rounded-xl text-sm font-medium text-white"
                      style={{ background: '#1D4ED8' }}>
                      Back to All
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── All Products (default bottom section) ── */}
            {activeCat === 'all' && !searchQuery && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-bold" style={{ color: '#0F172A' }}>All Products</h2>
                    <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{products.length} products available</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                      <button onClick={() => setGridView('grid4')} className="p-1.5 rounded-lg transition-colors"
                        style={{ background: gridView === 'grid4' ? '#EFF6FF' : 'transparent', color: gridView === 'grid4' ? '#1D4ED8' : '#94A3B8' }}>
                        <Grid3x3 size={14} />
                      </button>
                      <button onClick={() => setGridView('grid3')} className="p-1.5 rounded-lg transition-colors"
                        style={{ background: gridView === 'grid3' ? '#EFF6FF' : 'transparent', color: gridView === 'grid3' ? '#1D4ED8' : '#94A3B8' }}>
                        <List size={14} />
                      </button>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                      style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#475569' }}>
                      <SlidersHorizontal size={13} /> Filter
                    </button>
                  </div>
                </div>
                <div className={`grid ${gridCols} gap-4`}>
                  {products.map(p => (
                    <DesktopProductCard key={p.id} product={p} onSelect={setPreviewProduct} />
                  ))}
                </div>
              </div>
            )}

            {/* Footer strip */}
            <div className="pt-6" style={{ borderTop: '1px solid #E2E8F0' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #1D4ED8, #0EA5E9)' }}>
                    <Zap size={12} className="text-white" />
                  </div>
                  <span className="font-bold text-sm" style={{ color: '#0F172A' }}>SmashCommerce</span>
                </div>
                <p className="text-xs" style={{ color: '#94A3B8' }}>© 2026 SmashCommerce. All rights reserved.</p>
                <div className="flex items-center gap-4">
                  {['Privacy', 'Terms', 'Support'].map(l => (
                    <span key={l} className="text-xs cursor-pointer" style={{ color: '#94A3B8' }}>{l}</span>
                  ))}
                </div>
              </div>
            </div>

          </div>{/* end max-w-7xl */}
        </div>{/* end website content */}
      </div>{/* end browser frame */}

      {/* ── Product Quick View Modal ── */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={() => setPreviewProduct(null)}>
          <div className="rounded-3xl overflow-hidden w-full max-w-2xl"
            style={{ background: '#FFFFFF', boxShadow: '0 30px 80px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <div className="grid grid-cols-2">
              {/* Image */}
              <div className="relative" style={{ background: '#F8FAFC' }}>
                <img src={previewProduct.image} alt={previewProduct.name} className="w-full h-80 object-cover" />
                {previewProduct.badge && (
                  <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full text-white"
                    style={{ background: previewProduct.isNew ? '#8B5CF6' : '#1D4ED8' }}>
                    {previewProduct.badge}
                  </span>
                )}
                {previewProduct.originalPrice && (
                  <span className="absolute top-4 right-4 text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: '#EF4444', color: 'white' }}>
                    -{Math.round((1 - previewProduct.price / previewProduct.originalPrice) * 100)}%
                  </span>
                )}
              </div>
              {/* Details */}
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <button onClick={() => setPreviewProduct(null)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: '#F1F5F9' }}>
                    <X size={15} style={{ color: '#64748B' }} />
                  </button>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full capitalize font-medium"
                      style={{ background: `${CATEGORY_COLORS[previewProduct.category]}12`, color: CATEGORY_COLORS[previewProduct.category] }}>
                      {previewProduct.category}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: '#0EA5E9' }}>{previewProduct.brand}</span>
                  </div>
                  <h2 className="font-bold text-lg leading-snug mb-2" style={{ color: '#0F172A' }}>{previewProduct.name}</h2>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={13} fill={i < Math.floor(previewProduct.rating) ? '#F59E0B' : 'transparent'} style={{ color: '#F59E0B' }} />
                      ))}
                    </div>
                    <span className="text-xs" style={{ color: '#94A3B8' }}>{previewProduct.rating} · {previewProduct.reviewCount} reviews</span>
                  </div>
                  {previewProduct.description && (
                    <p className="text-sm leading-relaxed mb-4" style={{ color: '#64748B' }}>{previewProduct.description}</p>
                  )}
                  {previewProduct.features?.length > 0 && (
                    <div className="space-y-1 mb-4">
                      {previewProduct.features.slice(0, 3).map(f => (
                        <div key={f} className="flex items-center gap-2 text-xs" style={{ color: '#475569' }}>
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#1D4ED8' }} />
                          {f}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                      style={{ background: previewProduct.stock > 10 ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)', color: previewProduct.stock > 10 ? '#10B981' : '#F59E0B', border: `1px solid ${previewProduct.stock > 10 ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                      <Package size={11} /> Stock: {previewProduct.stock}
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold" style={{ color: '#0F172A' }}>{formatCurrency(previewProduct.price)}</p>
                      {previewProduct.originalPrice && (
                        <p className="text-sm line-through" style={{ color: '#CBD5E1' }}>{formatCurrency(previewProduct.originalPrice)}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button className="w-10 h-10 rounded-xl flex items-center justify-center"
                        onClick={() => toggleWishlist(previewProduct.id)}
                        style={{ background: wishlist.includes(previewProduct.id) ? 'rgba(239,68,68,0.1)' : '#F1F5F9', border: `1px solid ${wishlist.includes(previewProduct.id) ? 'rgba(239,68,68,0.25)' : '#E2E8F0'}` }}>
                        <Heart size={16} style={{ color: wishlist.includes(previewProduct.id) ? '#EF4444' : '#94A3B8', fill: wishlist.includes(previewProduct.id) ? '#EF4444' : 'transparent' }} />
                      </button>
                      <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', boxShadow: '0 4px 12px rgba(29,78,216,0.3)' }}>
                        <ShoppingCart size={15} /> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'manage' | 'preview'>('manage');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Manage tab state
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<Category | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(createEmptyForm());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        if (isMounted) {
          setProducts(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Gagal mengambil data produk.';
          setError(message);
          toast.error(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const buildProductId = (category: Category): string => {
    const prefixMap: Record<Category, string> = {
      racket: 'r',
      shoes: 's',
      shuttlecock: 'sc',
      string: 'st',
      bag: 'b',
      jersey: 'j',
    };

    return `${prefixMap[category]}${Date.now().toString().slice(-6)}`;
  };

  const defaultImageByCategory = (category: Category): string => {
    const imageMap: Record<Category, string> = {
      racket: IMG.racket,
      shoes: IMG.shoes,
      shuttlecock: IMG.shuttlecock,
      string: IMG.string,
      bag: IMG.bag,
      jersey: IMG.jersey,
    };

    return imageMap[category];
  };

  const resetForm = () => {
    setForm({
      ...createEmptyForm(),
      id: buildProductId('racket'),
      image: defaultImageByCategory('racket'),
    });
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === 'all' || p.category === catFilter;
      return matchSearch && matchCat;
    });
  }, [products, search, catFilter]);

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      await deleteAdminProduct(id);
      setProducts((ps) => ps.filter((p) => p.id !== id));
      setDeleteId(null);
      toast.success('Product deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus produk.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!form.id || !form.name || !form.brand || !form.price || !form.image || !form.description) {
      toast.error('Please fill required fields');
      return;
    }

    const parsedPrice = Number(form.price);
    const parsedOriginalPrice = form.originalPrice ? Number(form.originalPrice) : null;
    const parsedStock = Number(form.stock || '0');
    const parsedRating = Number(form.rating || '0');
    const parsedReviewCount = Number(form.reviewCount || '0');
    const parsedFeatures = parseFeaturesText(form.featuresText);
    const parsedSpecs = parseSpecsText(form.specsText);

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error('Harga tidak valid.');
      return;
    }

    if (parsedOriginalPrice !== null && (Number.isNaN(parsedOriginalPrice) || parsedOriginalPrice < 0)) {
      toast.error('Original price tidak valid.');
      return;
    }

    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      toast.error('Stok tidak valid.');
      return;
    }

    if (Number.isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
      toast.error('Rating harus antara 0 sampai 5.');
      return;
    }

    if (Number.isNaN(parsedReviewCount) || parsedReviewCount < 0) {
      toast.error('Review count tidak valid.');
      return;
    }

    if (parsedFeatures.length === 0) {
      toast.error('Features wajib diisi minimal 1 baris.');
      return;
    }

    if (Object.keys(parsedSpecs).length === 0) {
      toast.error('Specs wajib diisi minimal 1 baris.');
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        const current = products.find((p) => p.id === editingId);

        if (!current) {
          toast.error('Produk yang diedit tidak ditemukan.');
          return;
        }

        const payload: Product = {
          ...current,
          id: form.id,
          name: form.name,
          brand: form.brand,
          category: form.category,
          price: parsedPrice,
          originalPrice: parsedOriginalPrice,
          rating: parsedRating,
          reviewCount: parsedReviewCount,
          stock: parsedStock,
          image: form.image,
          badge: form.badge || undefined,
          description: form.description,
          features: parsedFeatures,
          specs: parsedSpecs,
          isNew: form.isNew,
          isBestSeller: form.isBestSeller,
          stringable: form.stringable,
        };

        const updated = await updateAdminProduct(editingId, payload);

        setProducts((ps) => ps.map((p) => (p.id === editingId ? updated : p)));
        toast.success('Product updated!');
      } else {
        const payload: Product = {
          id: form.id,
          name: form.name,
          brand: form.brand,
          category: form.category,
          price: parsedPrice,
          originalPrice: parsedOriginalPrice,
          rating: parsedRating,
          reviewCount: parsedReviewCount,
          stock: parsedStock,
          image: form.image,
          badge: form.badge || undefined,
          description: form.description,
          features: parsedFeatures,
          specs: parsedSpecs,
          isNew: form.isNew,
          isBestSeller: form.isBestSeller,
          stringable: form.stringable,
        };

        const created = await createAdminProduct(payload);
        setProducts((ps) => [created, ...ps]);
        toast.success('Product added!');
      }

      setShowForm(false);
      setEditingId(null);
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan produk.');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (p: Product) => {
    setForm({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: String(p.price),
      originalPrice: p.originalPrice != null ? String(p.originalPrice) : '',
      stock: String(p.stock),
      image: p.image,
      badge: p.badge ?? '',
      rating: String(p.rating),
      reviewCount: String(p.reviewCount),
      description: p.description,
      featuresText: p.features.join('\n'),
      specsText: formatSpecsToText(p.specs),
      isNew: Boolean(p.isNew),
      isBestSeller: Boolean(p.isBestSeller),
      stringable: Boolean(p.stringable),
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const inputClass = 'w-full px-3 py-2 rounded-xl text-sm outline-none';
  const inputStyle = { background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#0F172A' };

  return (
    <div className="min-h-screen" style={{ background: '#F1F5F9' }}>
      {/* ── Header + Tabs ── */}
      <div className="px-5 pt-5 pb-0" style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-bold text-xl" style={{ color: '#0F172A' }}>Products</h1>
            <p className="text-sm" style={{ color: '#94A3B8' }}>{loading ? 'Loading products...' : `${products.length} total products`}</p>
          </div>
          {activeTab === 'manage' && (
            <button
              onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-medium"
              style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', boxShadow: '0 2px 8px rgba(29,78,216,0.25)' }}>
              <Plus size={15} /> Add Product
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {[
            { id: 'manage',  icon: LayoutGrid, label: 'Manage Products' },
            { id: 'preview', icon: Store,      label: 'Store Preview' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as 'manage' | 'preview')}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all relative"
              style={{ color: activeTab === id ? '#1D4ED8' : '#94A3B8' }}
            >
              <Icon size={15} />
              {label}
              {activeTab === id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: '#1D4ED8' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Manage Tab ── */}
      {activeTab === 'manage' && (
        <div className="p-5 space-y-5">
          {error && (
            <div className="rounded-xl px-3 py-2 text-xs" style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FCA5A5' }}>
              {error}
            </div>
          )}

          {showForm && (
            <div className="rounded-2xl p-4 space-y-3 bg-white" style={{ border: '2px solid #1D4ED8', boxShadow: '0 4px 20px rgba(29,78,216,0.12)' }}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold" style={{ color: '#0F172A' }}>{editingId ? 'Edit Product' : 'New Product'}</h3>
                <button onClick={() => setShowForm(false)}><X size={18} style={{ color: '#94A3B8' }} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: '#475569' }}>Product ID *</label>
                  <input value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value }))} placeholder="r123456" className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: '#475569' }}>Product Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Product name" className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: '#475569' }}>Brand *</label>
                  <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="Brand" className={inputClass} style={inputStyle} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: '#475569' }}>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Category, stringable: e.target.value === 'racket' }))}
                    className={inputClass} style={{ ...inputStyle, appearance: 'none' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: '#475569' }}>Price (IDR) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="2000000" className={inputClass} style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#475569' }}>Stock</label>
                <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="50" className={inputClass} style={inputStyle} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: '#475569' }}>Original Price</label>
                  <input type="number" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} placeholder="2500000" className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: '#475569' }}>Badge</label>
                  <input value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} placeholder="Best Seller" className={inputClass} style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#475569' }}>Image URL *</label>
                <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." className={inputClass} style={inputStyle} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: '#475569' }}>Rating (0-5) *</label>
                  <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} placeholder="4.8" className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: '#475569' }}>Review Count *</label>
                  <input type="number" min="0" value={form.reviewCount} onChange={e => setForm(f => ({ ...f, reviewCount: e.target.value }))} placeholder="120" className={inputClass} style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#475569' }}>Description *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Product description..." rows={2}
                  className={`${inputClass} resize-none`} style={inputStyle} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#475569' }}>Features * (satu fitur per baris)</label>
                <textarea value={form.featuresText} onChange={e => setForm(f => ({ ...f, featuresText: e.target.value }))} placeholder="Power Cushion Technology\nHexagrip Outsole" rows={3}
                  className={`${inputClass} resize-none`} style={inputStyle} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#475569' }}>Specs * (bisa key:value, key=value, atau teks biasa)</label>
                <textarea value={form.specsText} onChange={e => setForm(f => ({ ...f, specsText: e.target.value }))} placeholder="Weight: 83g\nBalance = Head Heavy\nMade for advanced players" rows={3}
                  className={`${inputClass} resize-none`} style={inputStyle} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[{
                  key: 'isNew',
                  label: 'Is New',
                }, {
                  key: 'isBestSeller',
                  label: 'Best Seller',
                }, {
                  key: 'stringable',
                  label: 'Stringable',
                }].map((item) => (
                  <label key={item.key} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#334155' }}>
                    <input
                      type="checkbox"
                      checked={form[item.key as keyof Pick<ProductForm, 'isNew' | 'isBestSeller' | 'stringable'>] as boolean}
                      onChange={(e) => setForm((f) => ({ ...f, [item.key]: e.target.checked }))}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#94A3B8' }}>Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)' }}>
                  <Check size={14} /> {saving ? 'Saving...' : editingId ? 'Update' : 'Save Product'}
                </button>
              </div>
            </div>
          )}

          {/* Search & Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none bg-white"
                style={{ border: '1px solid #E2E8F0', color: '#0F172A', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              <button onClick={() => setCatFilter('all')}
                className="px-3 py-1 rounded-full text-xs whitespace-nowrap shrink-0"
                style={{ background: catFilter === 'all' ? '#1D4ED8' : '#FFFFFF', color: catFilter === 'all' ? 'white' : '#94A3B8', border: catFilter === 'all' ? '1px solid #1D4ED8' : '1px solid #E2E8F0' }}>
                All ({products.length})
              </button>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCatFilter(c)}
                  className="px-3 py-1 rounded-full text-xs capitalize whitespace-nowrap shrink-0"
                  style={{ background: catFilter === c ? CATEGORY_COLORS[c] : '#FFFFFF', color: catFilter === c ? 'white' : '#94A3B8', border: catFilter === c ? '1px solid transparent' : '1px solid #E2E8F0' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Product List */}
          <div className="space-y-2">
            {loading && (
              <div className="text-center py-10">
                <Package size={32} style={{ color: '#CBD5E1' }} className="mx-auto mb-2" />
                <p className="font-medium" style={{ color: '#0F172A' }}>Loading products...</p>
              </div>
            )}

            {filtered.map(p => (
              <div key={p.id} className="rounded-2xl p-3.5 flex items-center gap-3 bg-white"
                style={{ border: `1px solid ${p.stock < 10 ? 'rgba(245,158,11,0.3)' : '#E2E8F0'}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full capitalize"
                      style={{ background: `${CATEGORY_COLORS[p.category]}12`, color: CATEGORY_COLORS[p.category] }}>
                      {p.category}
                    </span>
                    {p.stock < 10 && (
                      <span className="flex items-center gap-0.5 text-[10px]" style={{ color: '#F59E0B' }}>
                        <AlertTriangle size={9} /> Low
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold line-clamp-1" style={{ color: '#0F172A' }}>{p.name}</p>
                  <p className="text-[10px]" style={{ color: '#94A3B8' }}>{p.brand} · Stock: {p.stock}</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: '#1D4ED8' }}>{formatCurrency(p.price)}</p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)' }}>
                    <Edit3 size={13} style={{ color: '#0EA5E9' }} />
                  </button>
                  <button onClick={() => setDeleteId(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <Trash2 size={13} style={{ color: '#EF4444' }} />
                  </button>
                </div>
              </div>
            ))}
            {!loading && filtered.length === 0 && (
              <div className="text-center py-10">
                <Package size={32} style={{ color: '#CBD5E1' }} className="mx-auto mb-2" />
                <p className="font-medium" style={{ color: '#0F172A' }}>No products found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Store Preview Tab ── */}
      {activeTab === 'preview' && (
        <div className="p-5">
          <StorePreview products={products} />
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.5)' }}>
          <div className="rounded-2xl p-5 w-full max-w-xs text-center bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <Trash2 size={22} style={{ color: '#EF4444' }} />
            </div>
            <h3 className="font-semibold mb-1" style={{ color: '#0F172A' }}>Delete Product?</h3>
            <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#94A3B8' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} disabled={deleting} className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                style={{ background: '#EF4444' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
