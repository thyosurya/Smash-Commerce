import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Package, Activity, Star, Settings, LogOut, ChevronRight, Award, Zap, Shield, Phone, Mail, Save, Edit2, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { fetchUserCrmSettings, type CrmTier } from '../../services/crmApi';
import { fetchMyOrders } from '../../services/orderApi';
import { fetchMyReviews } from '../../services/reviewApi';
import { updateProfileApi } from '../../services/authApi';
import { getAuthToken } from '../../services/authApi';
import { toast } from 'sonner';

export default function Profile() {
  const navigate = useNavigate();
  const { state, logout, dispatch } = useApp();
  const user = state.user!;
  const [tiers, setTiers] = useState<CrmTier[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [editPhone, setEditPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(user.phone ?? '');
  const [savingPhone, setSavingPhone] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProfileData = async () => {
      try {
        const [crm, orders, reviews] = await Promise.all([fetchUserCrmSettings(), fetchMyOrders(), fetchMyReviews()]);
        if (isMounted) {
          setTiers(crm.tiers ?? []);
          setOrderCount(orders.length);
          setReviewCount(reviews.length);
        }
      } catch {
        if (isMounted) {
          setTiers([]);
          setOrderCount(0);
          setReviewCount(0);
        }
      }
    };

    void loadProfileData();

    return () => {
      isMounted = false;
    };
  }, []);

  const sortedTiers = useMemo(
    () => [...tiers].sort((a, b) => a.minPoints - b.minPoints),
    [tiers],
  );

  const tier = useMemo(() => {
    if (sortedTiers.length === 0) {
      return {
        name: 'Member',
        minPoints: 0,
        maxPoints: null,
        color: '#64748B',
        icon: '🏸',
        discount: 0,
        perks: ['Loyalty Member'],
      } as CrmTier;
    }

    return sortedTiers.find((item, index) => {
      const next = sortedTiers[index + 1];
      return user.points >= item.minPoints && (!next || user.points < next.minPoints);
    }) ?? sortedTiers[0];
  }, [sortedTiers, user.points]);

  const tierIdx = sortedTiers.findIndex(t => t.name === tier.name);
  const nextTier = tierIdx < sortedTiers.length - 1 ? sortedTiers[tierIdx + 1] : null;
  const progress = nextTier
    ? Math.min(100, Math.round(((user.points - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100))
    : 100;

  const handleLogout = () => {
    logout();
    toast.success('Berhasil keluar');
    navigate('/login');
  };

  const handleSavePhone = async () => {
    setSavingPhone(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Token tidak ditemukan.');
      const updated = await updateProfileApi(token, { phone: phoneInput || null });
      dispatch({ type: 'SET_USER', payload: { phone: updated.phone ?? '' } });
      toast.success('Nomor HP berhasil disimpan 📱');
      setEditPhone(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal menyimpan nomor HP.');
    } finally {
      setSavingPhone(false);
    }
  };

  const MENU_ITEMS = [
    { icon: Package, label: 'Pesanan Saya', desc: 'Lacak pembelian kamu', path: '/orders', color: '#0EA5E9' },
    { icon: Activity, label: 'Log Aktivitas', desc: 'Riwayat browse & keranjang', path: '/activity', color: '#8B5CF6' },
    // { icon: Star, label: 'My Reviews', desc: 'Rate products you bought', path: '/orders', color: '#F59E0B' },
    // { icon: Settings, label: 'Settings', desc: 'Account preferences', path: '/profile', color: '#94A3B8' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#F0F4FF', fontFamily: "'Poppins', sans-serif" }}>
      {/* Header */}
      <div className="relative px-4 pt-10 pb-0">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 right-0 h-52 overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 60%, #0EA5E9 100%)' }} />
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
            <rect x="20" y="20" width="360" height="160" fill="none" stroke="white" strokeWidth="1" />
            <line x1="20" y1="100" x2="380" y2="100" stroke="white" strokeWidth="0.8" />
          </svg>
        </div>

        {/* Admin badge */}
        {user.isAdmin && (
          <div className="relative z-10 flex justify-end mb-2">
            <button onClick={() => navigate('/admin')}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ background: 'rgba(245,158,11,0.2)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
              <Zap size={11} /> Admin Panel
            </button>
          </div>
        )}

        {/* User info */}
        <div className="relative z-10 pb-4">
          <div className="flex-1 pb-1">
            <h1 className="text-white font-bold text-xl">{user.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${tier.color}30`, color: 'white', border: `1px solid ${tier.color}50` }}>
                {tier.icon} {tier.name}
              </span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Member sejak {new Date(user.joinDate).getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 pb-4">
        {/* Tier Progress Card */}
        <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs" style={{ color: '#94A3B8' }}>Tier Saat Ini</p>
              <h3 className="font-bold text-lg flex items-center gap-1.5" style={{ color: '#0F172A' }}>
                {tier.icon} {tier.name}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: '#94A3B8' }}>Total Poin</p>
              <p className="text-xl font-bold" style={{ color: '#F59E0B' }}>{user.points.toLocaleString()}</p>
            </div>
          </div>

          {nextTier && (
            <>
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: '#94A3B8' }}>{user.points.toLocaleString()} pts</span>
                <span style={{ color: '#94A3B8' }}>{nextTier.minPoints.toLocaleString()} pts untuk {nextTier.icon} {nextTier.name}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${tier.color}, ${nextTier.color})` }} />
              </div>
              <p className="text-xs mt-1.5" style={{ color: '#94A3B8' }}>
                {(nextTier.minPoints - user.points).toLocaleString()} pts lagi untuk mencapai {nextTier.name}
              </p>
            </>
          )}
          {!nextTier && (
            <div className="mt-2 p-2 rounded-xl text-center" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <p className="text-xs font-semibold" style={{ color: '#F59E0B' }}>🏆 Kamu sudah mencapai tier tertinggi!</p>
            </div>
          )}

          {/* Tier perks */}
          {/* <div className="mt-3 pt-3 border-t" style={{ borderColor: '#F1F5F9' }}>
            <p className="text-xs font-medium mb-2" style={{ color: '#475569' }}>Your Perks:</p>
            <div className="flex flex-wrap gap-1.5">
              {tier.perks.map(p => (
                <span key={p} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${tier.color}12`, color: tier.color, border: `1px solid ${tier.color}25` }}>
                  ✓ {p}
                </span>
              ))}
            </div>
          </div> */}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Pesanan', value: orderCount.toLocaleString('id-ID'), icon: Package, color: '#0EA5E9' },
            { label: 'Ulasan', value: reviewCount.toLocaleString('id-ID'), icon: Star, color: '#F59E0B' },
            { label: 'Poin', value: user.points.toLocaleString(), icon: Award, color: '#8B5CF6' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl p-3 text-center bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <Icon size={16} style={{ color }} className="mx-auto mb-1" />
              <p className="font-bold text-sm" style={{ color: '#0F172A' }}>{value}</p>
              <p className="text-[10px]" style={{ color: '#94A3B8' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="rounded-2xl p-4 space-y-3 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h3 className="font-semibold text-sm" style={{ color: '#0F172A' }}>Info Akun</h3>
          {/* Email */}
          <div className="flex items-center gap-2.5">
            <Mail size={14} style={{ color: '#1D4ED8' }} />
            <span className="text-sm" style={{ color: '#475569' }}>{user.email}</span>
          </div>
          {/* Phone — editable */}
          <div className="flex items-center gap-2.5">
            <Phone size={14} style={{ color: '#10B981' }} />
            {editPhone ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={e => setPhoneInput(e.target.value)}
                  placeholder="08123456789"
                  className="flex-1 text-sm px-2 py-1 rounded-lg outline-none"
                  style={{ border: '1px solid #1D4ED8', color: '#0F172A', background: '#F8FAFF' }}
                  autoFocus
                />
                <button onClick={handleSavePhone} disabled={savingPhone}
                  className="p-1.5 rounded-lg flex items-center gap-1 text-xs font-semibold"
                  style={{ background: '#1D4ED8', color: 'white' }}>
                  {savingPhone ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                </button>
                <button onClick={() => { setEditPhone(false); setPhoneInput(user.phone ?? ''); }}
                  className="p-1.5 rounded-lg text-xs"
                  style={{ background: '#F1F5F9', color: '#94A3B8' }}>✕</button>
              </div>
            ) : (
              <>
                <span className="text-sm flex-1" style={{ color: user.phone ? '#475569' : '#94A3B8' }}>
                  {user.phone || 'Belum diisi — wajib untuk notif WA'}
                </span>
                <button onClick={() => setEditPhone(true)}
                  className="p-1 rounded-lg" style={{ color: '#1D4ED8', background: '#EFF6FF' }}>
                  <Edit2 size={12} />
                </button>
              </>
            )}
          </div>
          {/* Verified */}
          <div className="flex items-center gap-2.5">
            <Shield size={14} style={{ color: '#10B981' }} />
            <span className="text-sm" style={{ color: '#475569' }}>Akun terverifikasi</span>
          </div>
        </div>

        {/* Menu */}
        <div className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          {MENU_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <button key={item.label} onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-slate-50"
                style={{ borderBottom: i < MENU_ITEMS.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${item.color}12` }}>
                  <Icon size={16} style={{ color: item.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: '#0F172A' }}>{item.label}</p>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>{item.desc}</p>
                </div>
                <ChevronRight size={16} style={{ color: '#CBD5E1' }} />
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-medium transition-colors"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
          <LogOut size={16} /> Keluar
        </button>
      </div>
    </div>
  );
}
