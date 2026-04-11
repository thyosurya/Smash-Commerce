// ─── Image Assets ─────────────────────────────────────────────────────────────
export const IMG = {
  racket: "https://images.unsplash.com/photo-1716155249759-b5f068f74e63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  shoes: "https://images.unsplash.com/photo-1727060167812-a53ac9b802d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  shuttlecock: "https://images.unsplash.com/photo-1765544581327-b5e9055d986c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  bag: "https://images.unsplash.com/photo-1769911112258-47da2e8eee67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  action: "https://images.unsplash.com/photo-1613918431551-b2ef2720387c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200",
  jersey: "https://images.unsplash.com/photo-1768492263433-b81fdcdce0e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  court: "https://images.unsplash.com/photo-1771909720886-a90afd1b37f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200",
  string: "https://images.unsplash.com/photo-1773186315376-88aaf9878707?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
};

// ─── Types ─────────────────────────────────────────────────────────────────────
export type Category = 'racket' | 'shoes' | 'shuttlecock' | 'string' | 'bag' | 'jersey';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  image: string;
  badge?: string;
  description: string;
  features: string[];
  specs: Record<string, string>;
  isNew?: boolean;
  isBestSeller?: boolean;
  stringable?: boolean;
}

export interface Review {
  id: string;
  userName: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: {
    product: Product;
    quantity: number;
    price: number;
    customization?: { stringType?: string; tension?: number };
  }[];
  subtotal: number;
  shipping: number;
  discount?: number;
  total: number;
  address: string;
  paymentMethod: string;
  trackingNumber?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customization?: { stringType?: string; tension?: number };
}

export interface ActivityEvent {
  id: string;
  type: 'view' | 'cart' | 'purchase' | 'review';
  productId?: string;
  productName?: string;
  productImage?: string;
  description: string;
  timestamp: string;
}

// ─── Products ──────────────────────────────────────────────────────────────────
export const products: Product[] = [
  {
    id: 'r001', name: 'Astrox 99 Pro', brand: 'Yonex', category: 'racket',
    price: 2850000, originalPrice: 3200000, rating: 4.9, reviewCount: 234, stock: 15,
    image: IMG.racket, badge: 'Best Seller',
    description: 'Engineered for elite attacking players, the Astrox 99 Pro delivers unmatched head-heavy power with Namd graphite technology for explosive smashes.',
    features: ['Namd Graphite Technology', 'Speed Flex', 'Built-in T-Joint', 'Isometric Head Shape'],
    specs: { Weight: '83g', Balance: 'Head Heavy', Flex: 'Stiff', Frame: 'HM Graphite', Shaft: 'HM Graphite' },
    isBestSeller: true, stringable: true,
  },
  {
    id: 'r002', name: 'Nanoflare 1000Z', brand: 'Yonex', category: 'racket',
    price: 3450000, originalPrice: 3800000, rating: 4.8, reviewCount: 189, stock: 8,
    image: IMG.racket, badge: 'New',
    description: 'Ultra-fast handling racket with revolutionary Sonic Flare System for lightning-quick defense.',
    features: ['Sonic Flare System', 'Rotational Generator System', 'Ultra-Thin Frame', 'Super-Light Shaft'],
    specs: { Weight: '72g', Balance: 'Head Light', Flex: 'Extra Stiff', Frame: 'HM Graphite', Shaft: 'HM Graphite' },
    isNew: true, stringable: true,
  },
  {
    id: 'r003', name: 'Armortec 900 Power', brand: 'Li-Ning', category: 'racket',
    price: 1850000, originalPrice: 2100000, rating: 4.6, reviewCount: 156, stock: 22,
    image: IMG.racket,
    description: 'A powerful offensive racket with carbon fiber composite for consistent smashing performance.',
    features: ['Carbon Fiber Frame', 'Aerodynamic Design', 'Vibration Dampening System', 'Reinforced T-Joint'],
    specs: { Weight: '85g', Balance: 'Head Heavy', Flex: 'Stiff', Frame: 'Carbon Fiber', Shaft: 'Carbon Fiber' },
    stringable: true,
  },
  {
    id: 'r004', name: 'Victor Thruster F Claw', brand: 'Victor', category: 'racket',
    price: 2250000, rating: 4.7, reviewCount: 98, stock: 12,
    image: IMG.racket, badge: 'Pro Choice',
    description: 'Pro-level control racket used by top-ranked players worldwide.',
    features: ['Pyrofil Material', 'Hard Cored Technology', 'Aerodynamic Frame', 'Quick-Start Feel'],
    specs: { Weight: '88g', Balance: 'Even', Flex: 'Medium Stiff', Frame: 'Pyrofil', Shaft: 'Slim Shaft' },
    isBestSeller: true, stringable: true,
  },
  {
    id: 's001', name: 'Power Cushion Eclipsion X2', brand: 'Yonex', category: 'shoes',
    price: 1650000, originalPrice: 1900000, rating: 4.8, reviewCount: 312, stock: 30,
    image: IMG.shoes, badge: 'Best Seller',
    description: 'Top-of-the-line badminton shoes with Power Cushion technology for superior shock absorption.',
    features: ['Power Cushion Technology', 'Hexagrip Outsole', 'Durable Skin+', 'Round Sole'],
    specs: { Type: 'Cushion', Sole: 'Rubber', Upper: 'Mesh + Synthetic', Width: 'Medium' },
    isBestSeller: true,
  },
  {
    id: 's002', name: 'Blade X Carbon', brand: 'Victor', category: 'shoes',
    price: 1250000, rating: 4.5, reviewCount: 145, stock: 18,
    image: IMG.shoes, isNew: true,
    description: 'Carbon-plate midsole design for explosive court movements and energy return.',
    features: ['Carbon Plate Midsole', 'Wide Toe Box', 'Breathable Upper', 'Anti-Slip Sole'],
    specs: { Type: 'Speed', Sole: 'Non-Marking Rubber', Upper: 'Mesh', Width: 'Wide' },
  },
  {
    id: 's003', name: 'Wave Claw 2', brand: 'Mizuno', category: 'shoes',
    price: 980000, originalPrice: 1100000, rating: 4.4, reviewCount: 87, stock: 25,
    image: IMG.shoes,
    description: 'Lightweight shoes optimized for all-court play with lateral stability.',
    features: ['Wave Technology', 'D-Flex Groove', 'Lateral Stability', 'Quick Movement Design'],
    specs: { Type: 'All-Round', Sole: 'GUM Rubber', Upper: 'Mesh', Width: 'Standard' },
  },
  {
    id: 'sc001', name: 'Aerosensa 40', brand: 'Yonex', category: 'shuttlecock',
    price: 195000, originalPrice: 220000, rating: 4.9, reviewCount: 523, stock: 200,
    image: IMG.shuttlecock, badge: 'Most Popular',
    description: 'Tournament-grade feather shuttlecock with consistent flight performance.',
    features: ['High-Quality Feather', 'Cork Base', 'Tournament Grade', 'Consistent Flight'],
    specs: { Type: 'Feather', Speed: '77 (Medium)', Base: 'Natural Cork', Quantity: '12 pcs/tube' },
    isBestSeller: true,
  },
  {
    id: 'sc002', name: 'Mavis 2000 Nylon', brand: 'Yonex', category: 'shuttlecock',
    price: 85000, rating: 4.5, reviewCount: 412, stock: 350,
    image: IMG.shuttlecock,
    description: 'Durable nylon shuttlecock for training and recreational play.',
    features: ['Nylon Skirt', 'Cork-Like Base', 'Durable', 'All-Weather Performance'],
    specs: { Type: 'Nylon', Speed: '79 (Fast)', Base: 'Composite', Quantity: '6 pcs/tube' },
  },
  {
    id: 'sc003', name: 'Titanium 50 Pro', brand: 'Li-Ning', category: 'shuttlecock',
    price: 145000, rating: 4.6, reviewCount: 234, stock: 150,
    image: IMG.shuttlecock, isNew: true,
    description: 'Professional feather shuttlecock with titanium-treated feathers for extra durability.',
    features: ['Titanium-Treated Feather', 'Enhanced Durability', 'Stable Flight', 'Premium Cork'],
    specs: { Type: 'Feather', Speed: '76 (Slow)', Base: 'Premium Cork', Quantity: '12 pcs/tube' },
  },
  {
    id: 'st001', name: 'BG80 Power', brand: 'Yonex', category: 'string',
    price: 125000, originalPrice: 145000, rating: 4.8, reviewCount: 389, stock: 500,
    image: IMG.string, badge: 'Top Rated',
    description: 'High-repulsion multifilament string for maximum power and durability.',
    features: ['High Repulsion Multifilament', 'Wear-Resistant', 'Thin Diameter', 'Power-Oriented'],
    specs: { Gauge: '0.68mm', Length: '10m', Type: 'Multifilament', Tension: '19-27 lbs' },
    isBestSeller: true,
  },
  {
    id: 'st002', name: 'Nanogy 99', brand: 'Yonex', category: 'string',
    price: 165000, rating: 4.9, reviewCount: 276, stock: 400,
    image: IMG.string, isNew: true,
    description: 'Ultra-thin string with exceptional control for touch players.',
    features: ['Ultra-Thin 0.69mm', 'Nanofiber Core', 'Control-Oriented', 'Shock Dampening'],
    specs: { Gauge: '0.69mm', Length: '10m', Type: 'Nanofiber', Tension: '20-30 lbs' },
  },
  {
    id: 'b001', name: 'Pro Tournament Bag 12R', brand: 'Yonex', category: 'bag',
    price: 895000, originalPrice: 1050000, rating: 4.7, reviewCount: 178, stock: 45,
    image: IMG.bag, badge: 'Best Seller',
    description: 'Spacious tournament bag holds up to 12 rackets with thermal insulation compartment.',
    features: ['12 Racket Capacity', 'Thermal Insulation', 'Shoe Compartment', 'Multiple Pockets'],
    specs: { Capacity: '12 Rackets', Material: 'Nylon', Dimensions: '78×32×34 cm', Weight: '1.2kg' },
    isBestSeller: true,
  },
  {
    id: 'b002', name: 'Team Backpack Pro', brand: 'Victor', category: 'bag',
    price: 485000, rating: 4.5, reviewCount: 134, stock: 60,
    image: IMG.bag, isNew: true,
    description: 'Ergonomic backpack for everyday players with padded back support.',
    features: ['2 Racket Compartment', 'Laptop Sleeve', 'Ergonomic Padding', 'Water Bottle Holder'],
    specs: { Capacity: '2 Rackets', Material: 'Polyester', Dimensions: '50×25×15 cm', Weight: '0.7kg' },
  },
  {
    id: 'j001', name: 'Aerobolt Jersey Pro', brand: 'Yonex', category: 'jersey',
    price: 385000, originalPrice: 450000, rating: 4.6, reviewCount: 89, stock: 80,
    image: IMG.jersey, badge: 'New Season',
    description: 'Official tournament jersey with moisture-wicking technology and ergonomic cut.',
    features: ['Quick Dry Technology', 'UV Protection', 'Ergonomic Fit', 'Anti-Microbial'],
    specs: { Material: 'Polyester 100%', Fit: 'Slim Fit', Neck: 'Round Neck', Care: 'Machine Wash' },
    isNew: true,
  },
  {
    id: 'j002', name: 'Speed Series T-Shirt', brand: 'Li-Ning', category: 'jersey',
    price: 245000, rating: 4.3, reviewCount: 67, stock: 120,
    image: IMG.jersey,
    description: 'Breathable training jersey for daily practice sessions.',
    features: ['Mesh Ventilation', 'Moisture Management', 'Lightweight', 'Relaxed Fit'],
    specs: { Material: 'Polyester/Spandex', Fit: 'Regular Fit', Neck: 'V-Neck', Care: 'Hand Wash' },
  },
];

// ─── Reviews ───────────────────────────────────────────────────────────────────
export const reviews: Review[] = [
  { id: 'rv1', userName: 'Rizky Pratama', avatar: 'https://i.pravatar.cc/60?img=11', rating: 5, comment: 'Amazing racket! The power and control is unmatched. My smash speed improved significantly.', date: '2026-03-15' },
  { id: 'rv2', userName: 'Dewi Rahayu', avatar: 'https://i.pravatar.cc/60?img=25', rating: 5, comment: 'Perfect for attacking play. The head-heavy balance gives incredible smash power.', date: '2026-03-10' },
  { id: 'rv3', userName: 'Andi Kusuma', avatar: 'https://i.pravatar.cc/60?img=33', rating: 4, comment: 'Great racket overall. A bit expensive but worth every penny for tournament play.', date: '2026-02-28' },
  { id: 'rv4', userName: 'Sari Wulandari', avatar: 'https://i.pravatar.cc/60?img=45', rating: 5, comment: 'Fast delivery and the product exceeded expectations. Highly recommend!', date: '2026-02-20' },
  { id: 'rv5', userName: 'Budi Santoso', avatar: 'https://i.pravatar.cc/60?img=52', rating: 4, comment: 'Quality product. The string tension is perfect for my playing style.', date: '2026-02-10' },
];

// ─── Orders ────────────────────────────────────────────────────────────────────
export const sampleOrders: Order[] = [
  {
    id: 'ORD-2026-001', date: '2026-03-28', status: 'delivered',
    items: [{ product: products[0], quantity: 1, price: 2850000 }],
    subtotal: 2850000, shipping: 35000, total: 2885000,
    address: 'Jl. Sudirman No. 45, Jakarta Selatan 12190', paymentMethod: 'Bank Transfer',
    trackingNumber: 'JNE1234567890',
  },
  {
    id: 'ORD-2026-002', date: '2026-04-01', status: 'shipped',
    items: [{ product: products[4], quantity: 1, price: 1650000 }, { product: products[7], quantity: 2, price: 390000 }],
    subtotal: 2040000, shipping: 25000, total: 2065000,
    address: 'Jl. Gatot Subroto No. 12, Jakarta Pusat 10270', paymentMethod: 'GoPay',
    trackingNumber: 'SICEPAT9876543',
  },
  {
    id: 'ORD-2026-003', date: '2026-04-03', status: 'processing',
    items: [{ product: products[10], quantity: 3, price: 375000 }],
    subtotal: 375000, shipping: 15000, total: 390000,
    address: 'Jl. Sudirman No. 45, Jakarta Selatan 12190', paymentMethod: 'OVO',
  },
];

// ─── Activity ──────────────────────────────────────────────────────────────────
export const sampleActivity: ActivityEvent[] = [
  { id: 'a1', type: 'purchase', productName: 'Astrox 99 Pro', productImage: IMG.racket, description: 'Purchased Astrox 99 Pro (1x)', timestamp: '2026-03-28T10:30:00Z' },
  { id: 'a2', type: 'view', productName: 'Nanoflare 1000Z', productImage: IMG.racket, description: 'Viewed Nanoflare 1000Z', timestamp: '2026-04-01T14:22:00Z' },
  { id: 'a3', type: 'cart', productName: 'Power Cushion Eclipsion X2', productImage: IMG.shoes, description: 'Added Power Cushion Eclipsion X2 to cart', timestamp: '2026-04-01T14:45:00Z' },
  { id: 'a4', type: 'purchase', productName: 'Power Cushion Eclipsion X2', productImage: IMG.shoes, description: 'Purchased Power Cushion Eclipsion X2 (1x)', timestamp: '2026-04-01T15:10:00Z' },
  { id: 'a5', type: 'view', productName: 'BG80 Power String', productImage: IMG.string, description: 'Viewed BG80 Power String', timestamp: '2026-04-02T09:15:00Z' },
  { id: 'a6', type: 'cart', productName: 'Aerosensa 40', productImage: IMG.shuttlecock, description: 'Added Aerosensa 40 to cart (3x)', timestamp: '2026-04-03T11:00:00Z' },
  { id: 'a7', type: 'review', productName: 'Astrox 99 Pro', productImage: IMG.racket, description: 'Left a 5-star review for Astrox 99 Pro', timestamp: '2026-04-04T08:30:00Z' },
];

// ─── Sales Data ────────────────────────────────────────────────────────────────
export const dailySalesData = [
  { day: 'Mon', sales: 8500000, orders: 34 },
  { day: 'Tue', sales: 12300000, orders: 48 },
  { day: 'Wed', sales: 9800000, orders: 39 },
  { day: 'Thu', sales: 15600000, orders: 62 },
  { day: 'Fri', sales: 19200000, orders: 78 },
  { day: 'Sat', sales: 24500000, orders: 95 },
  { day: 'Sun', sales: 18700000, orders: 72 },
];

export const monthlySalesData = [
  { month: 'Oct', sales: 285000000, orders: 1142 },
  { month: 'Nov', sales: 342000000, orders: 1368 },
  { month: 'Dec', sales: 489000000, orders: 1956 },
  { month: 'Jan', sales: 312000000, orders: 1248 },
  { month: 'Feb', sales: 378000000, orders: 1512 },
  { month: 'Mar', sales: 425000000, orders: 1700 },
  { month: 'Apr', sales: 168000000, orders: 672 },
];

export const categoryData = [
  { name: 'Racket', value: 42, color: '#2563EB' },
  { name: 'Shoes', value: 23, color: '#22D3EE' },
  { name: 'Shuttlecock', value: 15, color: '#8B5CF6' },
  { name: 'String', value: 10, color: '#10B981' },
  { name: 'Bag', value: 6, color: '#F59E0B' },
  { name: 'Jersey', value: 4, color: '#EF4444' },
];

// ─── Admin Analytics ───────────────────────────────────────────────────────────
export const topViewedProducts = [
  { product: products[0], views: 12453, cartAdds: 3421, purchases: 1876 },
  { product: products[4], views: 9876, cartAdds: 2987, purchases: 1543 },
  { product: products[7], views: 8234, cartAdds: 5421, purchases: 4123 },
  { product: products[1], views: 7654, cartAdds: 1234, purchases: 567 },
  { product: products[12], views: 5432, cartAdds: 1876, purchases: 987 },
];

export const abandonedCartProducts = [
  { product: products[1], cartAdds: 1234, conversions: 567, abandonRate: 54 },
  { product: products[3], cartAdds: 987, conversions: 321, abandonRate: 67 },
  { product: products[12], cartAdds: 765, conversions: 189, abandonRate: 75 },
  { product: products[5], cartAdds: 654, conversions: 287, abandonRate: 56 },
];

// ─── Audit Log ─────────────────────────────────────────────────────────────────
export const auditLog = [
  { id: 'al1', admin: 'Admin Budi', action: 'Price Update', detail: 'Astrox 99 Pro: Rp 3.200.000 → Rp 2.850.000', timestamp: '2026-04-05T09:15:00Z', type: 'price' },
  { id: 'al2', admin: 'Admin Sari', action: 'Stock Update', detail: 'Aerosensa 40: 150 → 200 units', timestamp: '2026-04-05T08:30:00Z', type: 'stock' },
  { id: 'al3', admin: 'Admin Budi', action: 'Product Added', detail: 'New product: Nanoflare 1000Z added to catalog', timestamp: '2026-04-04T16:45:00Z', type: 'product' },
  { id: 'al4', admin: 'Admin Andi', action: 'User Tier Update', detail: 'Pro tier threshold changed: 10000 → 12000 pts', timestamp: '2026-04-04T14:20:00Z', type: 'crm' },
  { id: 'al5', admin: 'Admin Sari', action: 'Price Update', detail: 'Power Cushion Eclipsion X2: Rp 1.900.000 → Rp 1.650.000', timestamp: '2026-04-03T11:00:00Z', type: 'price' },
  { id: 'al6', admin: 'Admin Budi', action: 'Stock Update', detail: 'BG80 Power: 350 → 500 units', timestamp: '2026-04-02T10:15:00Z', type: 'stock' },
  { id: 'al7', admin: 'Admin Andi', action: 'Order Refund', detail: 'Order ORD-2026-045 refunded: Rp 1.450.000', timestamp: '2026-04-01T15:30:00Z', type: 'order' },
  { id: 'al8', admin: 'Admin Sari', action: 'Product Deleted', detail: 'Discontinued: Victor SRS-9000 removed from catalog', timestamp: '2026-03-31T13:45:00Z', type: 'product' },
];

// ─── CRM Tiers ─────────────────────────────────────────────────────────────────
export const tiers = [
  { name: 'Newbie', minPoints: 0, maxPoints: 999, color: '#64748B', icon: '🏸', discount: 0, perks: ['Free Shipping on 1st Order', 'Birthday Bonus'] },
  { name: 'Amateur', minPoints: 1000, maxPoints: 4999, color: '#10B981', icon: '⚡', discount: 5, perks: ['5% Discount', 'Priority Support', 'Early Access Sales'] },
  { name: 'Pro', minPoints: 5000, maxPoints: 11999, color: '#2563EB', icon: '🎯', discount: 10, perks: ['10% Discount', 'Free Shipping All Orders', 'VIP Events Access'] },
  { name: 'Champion', minPoints: 12000, maxPoints: Infinity, color: '#F59E0B', icon: '🏆', discount: 15, perks: ['15% Discount', 'Free Stringing', 'Personal Coach Sessions', 'Exclusive Products'] },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

export const getProductsByCategory = (cat: Category) => products.filter(p => p.category === cat);

export const getCategoryLabel = (cat: Category): string => ({
  racket: 'Racket', shoes: 'Shoes', shuttlecock: 'Shuttlecock', string: 'String', bag: 'Bag', jersey: 'Jersey',
}[cat]);

export const getUserTier = (points: number) =>
  tiers.find((t, i) => points >= t.minPoints && (i === tiers.length - 1 || points < tiers[i + 1].minPoints)) || tiers[0];
