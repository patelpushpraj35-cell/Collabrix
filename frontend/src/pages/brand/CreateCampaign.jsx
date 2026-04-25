import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { Alert, Spinner } from '../../components/UI';
import api from '../../lib/api';

const NICHES = ['cricket','cooking','comedy','tech','streetfood','gaming','finance','yoga','coding','diy'];

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', nicheRequired: [], paymentMin: '', paymentMax: '', requirements: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleNiche = (n) => setForm(f => ({
    ...f,
    nicheRequired: f.nicheRequired.includes(n) ? f.nicheRequired.filter(x => x !== n) : [...f.nicheRequired, n],
  }));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/brand/campaigns', form);
      navigate('/brand/campaigns');
    } catch (err) { setError(err.response?.data?.error || 'Failed to create campaign'); }
    finally { setLoading(false); }
  };

  return (
    <AppLayout title="Create Campaign">
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>New Campaign</h2>
          <p className="text-secondary text-sm">Fill in the details to launch a creator campaign</p>
        </div>

        {error && <div style={{ marginBottom: 16 }}><Alert type="error" message={error} /></div>}

        <div className="card">
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="input-group">
              <label className="input-label">Campaign Title *</label>
              <input className="input" placeholder="e.g. Summer Tech Review Campaign"
                value={form.title} onChange={e => set('title', e.target.value)} required />
            </div>

            <div className="input-group">
              <label className="input-label">Required Niches</label>
              <div className="select-cards" style={{ marginTop: 8 }}>
                {NICHES.map(n => (
                  <div key={n} className={`select-card ${form.nicheRequired.includes(n) ? 'selected' : ''}`}
                    onClick={() => toggleNiche(n)} style={{ textTransform: 'capitalize' }}>
                    {n}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="input-group">
                <label className="input-label">Min Payment (₹)</label>
                <input className="input" type="number" placeholder="5000"
                  value={form.paymentMin} onChange={e => set('paymentMin', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Max Payment (₹)</label>
                <input className="input" type="number" placeholder="25000"
                  value={form.paymentMax} onChange={e => set('paymentMax', e.target.value)} />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Campaign Requirements *</label>
              <textarea className="input" rows={5}
                placeholder="Describe what creators need to do: content type, duration, key messages, deadlines..."
                value={form.requirements} onChange={e => set('requirements', e.target.value)} required />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/brand/campaigns')}>Cancel</button>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? <Spinner /> : '🚀 Launch Campaign'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
