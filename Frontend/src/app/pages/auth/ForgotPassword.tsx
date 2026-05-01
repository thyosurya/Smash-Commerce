import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, ArrowLeft, Zap, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
    toast.success('Link reset terkirim!');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#0A1628', fontFamily: "'Poppins', sans-serif" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full opacity-8 blur-3xl" style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)' }} />
      </div>

      <div className="relative w-full max-w-sm">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-8 text-sm transition-colors" style={{ color: '#64748B' }}>
          <ArrowLeft size={16} /> Kembali ke Login
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1D4ED8, #22D3EE)', boxShadow: '0 0 40px rgba(34,211,238,0.3)' }}>
            <Zap size={32} className="text-white" />
          </div>
          <h1 className="text-white text-xl font-bold">Reset Password</h1>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>Kami akan mengirimkan link reset</p>
        </div>

        <div className="rounded-3xl p-6" style={{ background: '#0F1F3D', border: '1px solid #1E3A6E' }}>
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: '#94A3B8' }}>Alamat Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: '#162040', border: '1px solid #1E3A6E', color: '#F1F5F9' }}
                    onFocus={e => e.currentTarget.style.borderColor = '#22D3EE'}
                    onBlur={e => e.currentTarget.style.borderColor = '#1E3A6E'} />
                </div>
              </div>

              <p className="text-xs" style={{ color: '#64748B' }}>
                Masukkan email yang terdaftar pada akun kamu dan kami akan mengirimkan link reset password.
              </p>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                style={{ background: loading ? '#1E3A6E' : 'linear-gradient(135deg, #1D4ED8, #2563EB)', boxShadow: loading ? 'none' : '0 4px 20px rgba(37,99,235,0.4)' }}>
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={15} /><span>Kirim Link Reset</span></>}
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
                <CheckCircle size={28} style={{ color: '#10B981' }} />
              </div>
              <h3 className="text-white font-semibold mb-1">Email Terkirim!</h3>
              <p className="text-sm mb-4" style={{ color: '#64748B' }}>
                Kami telah mengirimkan link reset ke <span style={{ color: '#22D3EE' }}>{email}</span>
              </p>
              <p className="text-xs mb-5" style={{ color: '#64748B' }}>Cek inbox kamu dan ikuti instruksinya. Link kadaluarsa dalam 15 menit.</p>
              <button onClick={() => navigate('/login')}
                className="w-full py-2.5 rounded-xl text-white font-medium text-sm"
                style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)' }}>
                Kembali ke Masuk
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
