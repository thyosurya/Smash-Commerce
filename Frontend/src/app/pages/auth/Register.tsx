import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock, Eye, EyeOff, User, Phone, Shield, Zap, ChevronRight, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../context/AppContext';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ karakter', ok: password.length >= 8 },
    { label: 'Huruf kapital', ok: /[A-Z]/.test(password) },
    { label: 'Angka', ok: /[0-9]/.test(password) },
  ];
  const strength = checks.filter(c => c.ok).length;
  const colors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all" style={{ background: i < strength ? colors[strength] : '#1E3A6E' }} />
        ))}
      </div>
      <div className="flex gap-3">
        {checks.map(c => (
          <div key={c.label} className="flex items-center gap-1 text-[10px]" style={{ color: c.ok ? '#10B981' : '#64748B' }}>
            <Check size={9} />{c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { register } = useApp();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Password tidak cocok"); return; }
    if (!agree) { toast.error('Harap setujui syarat & ketentuan'); return; }
    setLoading(true);
    const user = await register(form.name, form.email, form.password, form.confirm);
    setLoading(false);

    if (!user) {
      toast.error('Register gagal. Coba email lain atau cek input.');
      return;
    }

    toast.success('Akun berhasil dibuat!');
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0A1628', fontFamily: "'Poppins', sans-serif" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #22D3EE 0%, transparent 70%)' }} />
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-10">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1D4ED8, #22D3EE)', boxShadow: '0 0 30px rgba(34,211,238,0.3)' }}>
            <Zap size={26} className="text-white" />
          </div>
          <h1 className="text-white text-xl font-bold">Buat Akun</h1>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>Bergabung dengan komunitas Smash</p>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: '#0F1F3D', border: '1px solid #1E3A6E' }}>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full name */}
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: '#94A3B8' }}>Nama Lengkap</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
                <input type="text" value={form.name} onChange={set('name')} required placeholder="Nama lengkap kamu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: '#162040', border: '1px solid #1E3A6E', color: '#F1F5F9' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#22D3EE'}
                  onBlur={e => e.currentTarget.style.borderColor = '#1E3A6E'} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: '#94A3B8' }}>Alamat Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
                <input type="email" value={form.email} onChange={set('email')} required placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: '#162040', border: '1px solid #1E3A6E', color: '#F1F5F9' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#22D3EE'}
                  onBlur={e => e.currentTarget.style.borderColor = '#1E3A6E'} />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: '#94A3B8' }}>Nomor Telepon</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
                <input type="tel" value={form.phone} onChange={set('phone')} required placeholder="+62 812 3456 7890"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: '#162040', border: '1px solid #1E3A6E', color: '#F1F5F9' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#22D3EE'}
                  onBlur={e => e.currentTarget.style.borderColor = '#1E3A6E'} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: '#94A3B8' }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} required placeholder="Min. 8 karakter"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: '#162040', border: '1px solid #1E3A6E', color: '#F1F5F9' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#22D3EE'}
                  onBlur={e => e.currentTarget.style.borderColor = '#1E3A6E'} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {showPw ? <EyeOff size={15} style={{ color: '#64748B' }} /> : <Eye size={15} style={{ color: '#64748B' }} />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm */}
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: '#94A3B8' }}>Konfirmasi Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
                <input type="password" value={form.confirm} onChange={set('confirm')} required placeholder="Ulangi password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: '#162040', border: '1px solid #1E3A6E', color: '#F1F5F9',
                    borderColor: form.confirm && form.confirm !== form.password ? '#EF4444' : form.confirm && form.confirm === form.password ? '#10B981' : '#1E3A6E' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#22D3EE'}
                  onBlur={e => e.currentTarget.style.borderColor = '#1E3A6E'} />
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <div
                onClick={() => setAgree(!agree)}
                className="w-4 h-4 mt-0.5 rounded flex items-center justify-center shrink-0 transition-colors"
                style={{ background: agree ? '#2563EB' : 'transparent', border: `1.5px solid ${agree ? '#2563EB' : '#1E3A6E'}` }}
              >
                {agree && <Check size={10} className="text-white" />}
              </div>
              <span className="text-xs" style={{ color: '#64748B' }}>
                Saya setuju dengan <span style={{ color: '#22D3EE' }}>Syarat & Ketentuan</span> dan <span style={{ color: '#22D3EE' }}>Kebijakan Privasi</span>
              </span>
            </label>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              style={{ background: loading ? '#1E3A6E' : 'linear-gradient(135deg, #1D4ED8, #2563EB)', boxShadow: loading ? 'none' : '0 4px 20px rgba(37,99,235,0.4)' }}>
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Buat Akun</span><ChevronRight size={16} /></>}
            </button>
          </form>

          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="flex items-center gap-1 text-[10px]" style={{ color: '#64748B' }}>
              <Shield size={10} style={{ color: '#10B981' }} /> 256-bit SSL
            </div>
            <div className="w-px h-3" style={{ background: '#1E3A6E' }} />
            <div className="flex items-center gap-1 text-[10px]" style={{ color: '#64748B' }}>
              <Shield size={10} style={{ color: '#10B981' }} /> GDPR Compliant
            </div>
          </div>
        </div>

        <p className="text-sm mt-5" style={{ color: '#64748B' }}>
          Sudah punya akun?{' '}
          <Link to="/login" style={{ color: '#22D3EE' }} className="font-medium">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
