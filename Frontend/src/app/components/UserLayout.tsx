import { Outlet, useNavigate, useLocation } from 'react-router';
import { Home, ShoppingCart, Package, User, Wrench } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useEffect } from 'react';

const NAV_ITEMS = [
  { icon: Home, label: 'Beranda', path: '/' },
  { icon: ShoppingCart, label: 'Keranjang', path: '/cart' },
  { icon: Wrench, label: 'Pasang Senar', path: '/stringing-service' },
  { icon: Package, label: 'Pesanan', path: '/orders' },
  { icon: User, label: 'Profil', path: '/profile' },
];

export function UserLayout() {
  const { state, cartCount } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const protectedPaths = ['/profile', '/orders', '/activity', '/checkout', '/stringing-service'];
    if (!state.isAuthenticated && protectedPaths.includes(location.pathname)) {
      navigate('/login', { replace: true });
    } else if (state.user?.isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [state.isAuthenticated, state.user, navigate, location.pathname]);

  return (
    <div className="min-h-screen" style={{ background: '#F0F4FF', fontFamily: "'Poppins', sans-serif" }}>
      <div className="pb-20 min-h-screen">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t"
        style={{ background: '#FFFFFF', borderColor: '#E2E8F0', paddingBottom: 'env(safe-area-inset-bottom)', boxShadow: '0 -2px 12px rgba(0,0,0,0.06)' }}
      >
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => {
                const protectedPaths = ['/profile', '/orders', '/stringing-service'];
                if (!state.isAuthenticated && protectedPaths.includes(path)) {
                  navigate('/login');
                } else {
                  navigate(path);
                }
              }}
              className="flex flex-col items-center gap-0.5 py-3 px-5 relative transition-all"
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{ color: isActive ? '#1D4ED8' : '#94A3B8' }}
                />
                {label === 'Cart' && cartCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-semibold"
                    style={{ background: '#EF4444', fontSize: '10px' }}
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px]" style={{ color: isActive ? '#1D4ED8' : '#94A3B8', fontWeight: isActive ? 600 : 400 }}>
                {label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full" style={{ background: '#1D4ED8' }} />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}