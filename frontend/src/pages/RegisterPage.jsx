import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert, Spinner } from '../components/UI';

const NICHES = [
  { id: 'cricket', label: 'Cricket & Sports Analysis', icon: '🏏' },
  { id: 'cooking', label: 'Miniature Cooking', icon: '🍳' },
  { id: 'comedy', label: 'Regional Comedy', icon: '😂' },
  { id: 'tech', label: 'Tech & Gadget Reviews', icon: '💻' },
  { id: 'streetfood', label: 'Street Food Vlogging', icon: '🍜' },
  { id: 'gaming', label: 'Mobile Gaming', icon: '🎮' },
  { id: 'finance', label: 'Personal Finance', icon: '💰' },
  { id: 'yoga', label: 'Health & Yoga', icon: '🧘' },
  { id: 'coding', label: 'Educational/Coding Tutorials', icon: '👨‍💻' },
  { id: 'diy', label: 'DIY & Home Decor', icon: '🏠' },
];

const PLATFORMS = [
  { id: 'youtube', label: 'YouTube', icon: '▶️' },
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'facebook', label: 'Facebook', icon: '👤' },
  { id: 'snapchat', label: 'Snapchat', icon: '👻' },
  { id: 'sharechat', label: 'ShareChat', icon: '💬' },
  { id: 'moj', label: 'Moj', icon: '🎵' },
  { id: 'josh', label: 'Josh', icon: '🎬' },
  { id: 'twitter', label: 'X (Twitter)', icon: '🐦' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'pinterest', label: 'Pinterest', icon: '📌' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [step, setStep] = useState(0); // 0=Role, 1=Basic, 2=Niche, 3=Platforms, 4=Stats, 5=Content
  const [form, setForm] = useState({
    name: '', email: '', mobile: '', password: '', 
    companyName: '', valuation: '',
    niche: [], platforms: [], followers: '', avgViews: '', avgLikes: '',
    contentType: '', channelUrl: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => {
    setError('');
    setForm(f => ({ ...f, [k]: v }));
  };

  const toggle = (k, v) => {
    setError('');
    setForm(f => ({
      ...f,
      [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v]
    }));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.name.trim() || !form.email.trim() || !form.mobile.trim() || !form.password) {
        setError('All basic fields are required.');
        return false;
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return false;
      }
      if (role === 'brand') {
        if (!form.companyName.trim()) {
          setError('Company name is required.');
          return false;
        }
      }
    }
    if (role === 'creator') {
      if (step === 2 && form.niche.length === 0) {
        setError('Please select at least one niche.');
        return false;
      }
      if (step === 3 && form.platforms.length === 0) {
        setError('Please select at least one platform.');
        return false;
      }
      if (step === 4) {
        if (!form.followers || !form.avgViews || !form.avgLikes) {
          setError('All statistics are required.');
          return false;
        }
        if (Number(form.followers) <= 0 || Number(form.avgViews) <= 0 || Number(form.avgLikes) <= 0) {
          setError('Values must be greater than 0.');
          return false;
        }
      }
      if (step === 5) {
        if (!form.contentType) {
          setError('Please select a content type.');
          return false;
        }
        if (!form.channelUrl.trim()) {
          setError('Channel URL is required.');
          return false;
        }
        try {
          new URL(form.channelUrl);
        } catch {
          setError('Please enter a valid URL.');
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => {
    setStep(s => s - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateStep()) return;
    
    setError(''); setLoading(true);
    try {
      await register({ ...form, role });
      navigate('/pending');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-layout">
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 420, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
            <span style={{ color: 'var(--primary)' }}>Collab</span>rix
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Join thousands of creators and brands already growing together on Collabrix.
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap" style={{ maxWidth: 500, width: '100%' }}>
          
          {role === 'creator' && step > 0 && (
            <div className="progress-steps" style={{ marginBottom: 32 }}>
              {['Basic Info', 'Niche', 'Platforms', 'Stats', 'Channel'].map((s, i) => {
                const stepNum = i + 1;
                return (
                  <div key={s} className="step-item">
                    <div className={`step-circle ${stepNum < step ? 'done' : stepNum === step ? 'active' : ''}`}>
                      {stepNum < step ? '✓' : stepNum}
                    </div>
                    {i < 4 && <div className={`step-line ${stepNum < step ? 'done' : ''}`} />}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
              {step === 0 ? 'Create Account' : role === 'brand' ? 'Brand Registration' : `Creator Onboarding - Step ${step}`}
            </h2>
            <p className="text-secondary text-sm">
              {step === 0 ? 'Join Collabrix today' : role === 'brand' ? 'Complete your brand profile' : 'Tell us about your content'}
            </p>
          </div>

          {error && <div style={{ marginBottom: 16 }}><Alert type="error" message={error} onClose={() => setError('')} /></div>}

          {step === 0 && (
            <div>
              <p className="text-secondary text-sm" style={{ marginBottom: 16 }}>I am registering as a...</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {[
                  { r: 'creator', emoji: '🎨', title: 'Creator / Influencer', desc: 'I create content and want brand deals' },
                  { r: 'brand', emoji: '🏢', title: 'Brand / Business', desc: 'I want to collaborate with creators' },
                ].map(({ r, emoji, title, desc }) => (
                  <button key={r} onClick={() => { setRole(r); setStep(1); }}
                    className="card card-hover" style={{ textAlign: 'left', cursor: 'pointer', border: role === r ? '2px solid var(--primary)' : undefined }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontSize: 28 }}>{emoji}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{title}</div>
                        <div className="text-secondary text-sm">{desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label className="input-label">Full Name <span style={{ color: 'red' }}>*</span></label>
                <input className="input" placeholder="John Doe" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Email <span style={{ color: 'red' }}>*</span></label>
                <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Mobile Number <span style={{ color: 'red' }}>*</span></label>
                <input className="input" type="tel" placeholder="9876543210" value={form.mobile} onChange={e => set('mobile', e.target.value)} />
              </div>
              {role === 'brand' && (
                <>
                  <div className="input-group">
                    <label className="input-label">Company Name <span style={{ color: 'red' }}>*</span></label>
                    <input className="input" placeholder="Acme Corp" value={form.companyName} onChange={e => set('companyName', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Company Valuation (₹)</label>
                    <input className="input" type="number" placeholder="10000000" value={form.valuation} onChange={e => set('valuation', e.target.value)} />
                  </div>
                </>
              )}
              <div className="input-group">
                <label className="input-label">Password <span style={{ color: 'red' }}>*</span></label>
                <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} />
              </div>
            </div>
          )}

          {role === 'creator' && step === 2 && (
            <div>
              <p className="text-secondary text-sm" style={{ marginBottom: 16 }}>Select your content niches (at least 1) <span style={{ color: 'red' }}>*</span></p>
              <div className="select-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {NICHES.map(n => (
                  <div key={n.id} className={`select-card ${form.niche.includes(n.id) ? 'selected' : ''}`}
                    onClick={() => toggle('niche', n.id)}>
                    <div className="card-icon">{n.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{n.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {role === 'creator' && step === 3 && (
            <div>
              <p className="text-secondary text-sm" style={{ marginBottom: 16 }}>Select your primary platforms (at least 1) <span style={{ color: 'red' }}>*</span></p>
              <div className="select-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {PLATFORMS.map(p => (
                  <div key={p.id} className={`select-card ${form.platforms.includes(p.id) ? 'selected' : ''}`}
                    onClick={() => toggle('platforms', p.id)}>
                    <div className="card-icon">{p.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{p.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {role === 'creator' && step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label className="input-label">Total Followers / Subscribers <span style={{ color: 'red' }}>*</span></label>
                <input className="input" type="number" placeholder="50000" value={form.followers}
                  onChange={e => set('followers', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Average Views per Post <span style={{ color: 'red' }}>*</span></label>
                <input className="input" type="number" placeholder="10000" value={form.avgViews}
                  onChange={e => set('avgViews', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Average Likes per Post <span style={{ color: 'red' }}>*</span></label>
                <input className="input" type="number" placeholder="2000" value={form.avgLikes}
                  onChange={e => set('avgLikes', e.target.value)} />
              </div>
            </div>
          )}

          {role === 'creator' && step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <p className="text-secondary text-sm" style={{ marginBottom: 16 }}>Content Type <span style={{ color: 'red' }}>*</span></p>
                <div className="toggle-group" style={{ display: 'flex', gap: 8 }}>
                  {['short', 'long', 'both'].map(t => (
                    <button key={t} className={`toggle-btn ${form.contentType === t ? 'active' : ''}`}
                      style={{ flex: 1, padding: '12px 0', borderRadius: 8, border: '1px solid var(--border)', background: form.contentType === t ? 'var(--primary)' : 'transparent', color: form.contentType === t ? '#fff' : 'inherit' }}
                      onClick={() => set('contentType', t)}>
                      {t === 'short' ? 'Short Video' : t === 'long' ? 'Long Video' : 'Both'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Channel / Profile URL <span style={{ color: 'red' }}>*</span></label>
                <input className="input" type="url" placeholder="https://youtube.com/@yourhandle"
                  value={form.channelUrl} onChange={e => set('channelUrl', e.target.value)} />
              </div>
            </div>
          )}

          {step > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, gap: 12 }}>
              <button type="button" className="btn btn-secondary" onClick={handleBack}>← Back</button>
              
              {role === 'brand' ? (
                <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                  {loading ? <Spinner /> : 'Submit Registration'}
                </button>
              ) : (
                step < 5 ? (
                  <button type="button" className="btn btn-primary" onClick={handleNext}>Continue →</button>
                ) : (
                  <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? <Spinner /> : 'Submit Profile'}
                  </button>
                )
              )}
            </div>
          )}

          {step === 0 && (
            <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
              Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
