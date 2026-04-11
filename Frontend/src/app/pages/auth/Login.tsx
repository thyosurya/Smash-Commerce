import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock, Eye, EyeOff, Shield, Zap, ChevronRight, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';

// function PasswordStrength({ password }: { password: string }) {
//   const checks = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)];
//   const strength = checks.filter(Boolean).length;
//   const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
//   const colors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'];
//   if (!password) return null;
//   return (
//     <div className="mt-1.5 space-y-1.5">
//       <div className="flex gap-1">
//         {[1, 2, 3, 4].map(i => (
//           <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
//             style={{ background: i <= strength ? colors[strength] : '#1E3A6E' }} />
//         ))}
//       </div>
//       <p className="text-xs" style={{ color: colors[strength] }}>{labels[strength]}</p>
//     </div>
//   );
// }

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useApp();
  const navigate = useNavigate();

  // Quick fill helpers
  const fillUser = () => { setEmail('user@smash.com'); setPassword('user123'); };
  const fillAdmin = () => { setEmail('admin@smash.com'); setPassword('admin123'); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const user = await login(email, password);
    setLoading(false);
    if (user) {
      toast.success('Welcome back! 🏸');
      navigate(user.isAdmin ? '/admin' : '/', { replace: true });
    } else {
      setError('Invalid email or password. Coba akun demo di bawah.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0A1628', fontFamily: "'Poppins', sans-serif" }}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)' }} />
        <div className="absolute bottom-20 right-0 w-64 h-64 rounded-full opacity-8 blur-3xl"
          style={{ background: 'radial-gradient(circle, #22D3EE 0%, transparent 70%)' }} />
        {/* Court lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
          <rect x="40" y="100" width="320" height="600" fill="none" stroke="#22D3EE" strokeWidth="1.5" />
          <line x1="40" y1="400" x2="360" y2="400" stroke="#22D3EE" strokeWidth="1.5" />
          <line x1="200" y1="100" x2="200" y2="400" stroke="#22D3EE" strokeWidth="1" />
          <line x1="40" y1="220" x2="360" y2="220" stroke="#22D3EE" strokeWidth="0.8" />
          <line x1="40" y1="580" x2="360" y2="580" stroke="#22D3EE" strokeWidth="0.8" />
        </svg>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #1D4ED8, #22D3EE)', boxShadow: '0 0 40px rgba(34,211,238,0.3)' }}>
            <Zap size={32} className="text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Smash Commerce</h1>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>Your ultimate badminton store</p>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: '#0F1F3D', border: '1px solid #1E3A6E' }}>
          <h2 className="text-white font-semibold text-lg mb-1">Welcome back 👋</h2>
          <p className="text-sm mb-6" style={{ color: '#64748B' }}>Sign in to continue shopping</p>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl mb-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: '#94A3B8' }}>Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: '#162040', border: '1px solid #1E3A6E', color: '#F1F5F9' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#22D3EE'}
                  onBlur={e => e.currentTarget.style.borderColor = '#1E3A6E'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: '#94A3B8' }}>Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="Enter password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: '#162040', border: '1px solid #1E3A6E', color: '#F1F5F9' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#22D3EE'}
                  onBlur={e => e.currentTarget.style.borderColor = '#1E3A6E'}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {showPw ? <EyeOff size={16} style={{ color: '#64748B' }} /> : <Eye size={16} style={{ color: '#64748B' }} />}
                </button>
              </div>
              {/* <PasswordStrength password={password} /> */}
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs" style={{ color: '#22D3EE' }}>Forgot password?</Link>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              style={{ background: loading ? '#1E3A6E' : 'linear-gradient(135deg, #1D4ED8, #2563EB)', boxShadow: loading ? 'none' : '0 4px 20px rgba(37,99,235,0.4)' }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Sign In</span><ChevronRight size={16} /></>
              )}
            </button>
          </form>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="flex items-center gap-1 text-[10px]" style={{ color: '#64748B' }}>
              <Shield size={10} style={{ color: '#10B981' }} /> SSL Encrypted
            </div>
            <div className="w-px h-3" style={{ background: '#1E3A6E' }} />
            <div className="flex items-center gap-1 text-[10px]" style={{ color: '#64748B' }}>
              <Shield size={10} style={{ color: '#10B981' }} /> Data Protected
            </div>
          </div>
        </div>

        <p className="text-sm mt-5" style={{ color: '#64748B' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#22D3EE' }} className="font-medium">Create Account</Link>
        </p>

        {/* Role selector */}
        <div className="w-full max-w-sm mt-4 rounded-2xl overflow-hidden" style={{ border: '1px solid #1E3A6E' }}>
          <div className="flex items-center gap-2 px-3 py-2" style={{ background: '#0A1628', borderBottom: '1px solid #1E3A6E' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22D3EE' }} />
            <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#334155' }}>Select Role</p>
          </div>
          <div className="grid grid-cols-2" style={{ background: '#0F1F3D' }}>
            {/* User card */}
            <button
              onClick={fillUser}
              className="group flex flex-col items-center gap-2 p-4 transition-all"
              style={{ borderRight: '1px solid #1E3A6E', background: 'transparent' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0D1E3A')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-transform group-hover:scale-110"
                style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)' }}>
                👤
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold" style={{ color: '#22D3EE' }}>User</p>
                <p className="text-[9px] mt-0.5" style={{ color: '#334155' }}>Shop & orders</p>
              </div>
              <div className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,211,238,0.08)', color: '#22D3EE', border: '1px solid rgba(34,211,238,0.15)' }}>
                user@smash.com
              </div>
            </button>

            {/* Admin card */}
            <button
              onClick={fillAdmin}
              className="group flex flex-col items-center gap-2 p-4 transition-all"
              style={{ background: 'transparent' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0D1E3A')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-transform group-hover:scale-110"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                ⚙️
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold" style={{ color: '#F59E0B' }}>Admin</p>
                <p className="text-[9px] mt-0.5" style={{ color: '#334155' }}>Dashboard & panel</p>
              </div>
              <div className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.08)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.15)' }}>
                admin@smash.com
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}