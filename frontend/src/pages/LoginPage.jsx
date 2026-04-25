import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert, Spinner } from '../components/UI';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'brand') navigate('/brand');
      else navigate('/creator');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  const fillDemo = (email, pw) => setForm({ email, password: pw });

  return (
    <div className="auth-layout">
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 420, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12, lineHeight: 1.2 }}>
            <span style={{ color: 'var(--primary)' }}>Collab</span>rix
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
            The creator economy platform where brands meet top influencers to launch powerful campaigns.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
            {['🎯 Smart campaign matching','💰 Secure payment workflows','📊 Real-time analytics'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 12, color: 'var(--text-secondary)', fontSize: 14 }}>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Welcome back</h2>
            <p className="text-secondary text-sm">Sign in to your Collabrix account</p>
          </div>

          {error && <div style={{ marginBottom: 16 }}><Alert type="error" message={error} onClose={() => setError('')} /></div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email}
                onChange={e => set('email', e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={e => set('password', e.target.value)}
                  style={{ paddingRight: 44 }} required />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
              {loading ? <Spinner /> : 'Sign In'}
            </button>
          </form>

          <div className="divider-text" style={{ margin: '20px 0' }}>Quick demo</div>
          <div style={{ display: 'grid', grid: 'auto/repeat(3,1fr)', gap: 8 }}>
            {[
              { label: '👑 Admin', e: 'admin@collabrix.io', p: 'admin123' },
              { label: '🎨 Creator', e: 'creator@test.com', p: 'test123' },
              { label: '🏢 Brand', e: 'brand@test.com', p: 'test123' },
            ].map(d => (
              <button key={d.label} className="btn btn-secondary btn-sm" onClick={() => fillDemo(d.e, d.p)}>
                {d.label}
              </button>
            ))}
          </div>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
