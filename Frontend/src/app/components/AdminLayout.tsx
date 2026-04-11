import { Outlet, useNavigate, useLocation, Link } from 'react-router';
import { BarChart3, Users, Package, FileText, Settings, LogOut, TrendingUp, ChevronRight, Menu, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { icon: BarChart3, label: 'Dashboard', path: '/admin' },
  { icon: TrendingUp, label: 'Sales Report', path: '/admin/sales' },
  { icon: Users, label: 'User Analytics', path: '/admin/users' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: FileText, label: 'Audit Log', path: '/admin/audit' },
  { icon: Settings, label: 'CRM Settings', path: '/admin/crm' },
];

export function AdminLayout() {
  const { state, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!state.isAuthenticated || !state.user?.isAdmin) navigate('/login', { replace: true });
  }, [state.isAuthenticated, state.user, navigate]);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen flex" style={{ background: '#F1F5F9', fontFamily: "'Poppins', sans-serif" }}>
      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: '#0A1628', borderRight: '1px solid #1E3A6E' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: '#1E3A6E' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563EB, #22D3EE)' }}>
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-none">Smash Commerce</div>
            <div className="text-[10px] mt-0.5" style={{ color: '#22D3EE' }}>Admin Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group"
                style={{
                  background: isActive ? 'linear-gradient(135deg, rgba(37,99,235,0.25), rgba(34,211,238,0.15))' : 'transparent',
                  color: isActive ? '#22D3EE' : '#64748B',
                  border: isActive ? '1px solid rgba(34,211,238,0.25)' : '1px solid transparent',
                }}
              >
                <Icon size={17} />
                <span className="text-sm font-medium">{label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t" style={{ borderColor: '#1E3A6E' }}>
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl" style={{ background: '#0F1F3D' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'rgba(34,211,238,0.18)', color: '#22D3EE' }}>
              {(state.user?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-medium truncate">{state.user?.name}</div>
              <div className="text-[10px]" style={{ color: '#64748B' }}>Administrator</div>
            </div>
            <button onClick={handleLogout} className="p-1 rounded-lg transition-colors hover:bg-red-500/10" title="Logout">
              <LogOut size={14} style={{ color: '#EF4444' }} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar (mobile) */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b sticky top-0 z-30" style={{ background: '#FFFFFF', borderColor: '#E2E8F0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg" style={{ color: '#475569' }}>
            <Menu size={20} />
          </button>
          <span className="font-semibold text-sm" style={{ color: '#0F172A' }}>Smash Commerce Admin</span>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}