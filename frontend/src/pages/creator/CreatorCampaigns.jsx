import { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { LoadingCenter, EmptyState, Alert, Badge, SkeletonCard } from '../../components/UI';
import api from '../../lib/api';
import { Megaphone, Zap } from 'lucide-react';

export default function CreatorCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [alert, setAlert] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/creators/campaigns').then(r => setCampaigns(r.data.campaigns)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const apply = async (id) => {
    setApplying(id);
    try {
      await api.post(`/creators/campaigns/${id}/apply`);
      setAlert({ type: 'success', msg: 'Application submitted successfully!' });
      load();
    } catch (e) {
      setAlert({ type: 'error', msg: e.response?.data?.error || 'Failed to apply' });
    } finally { setApplying(null); }
  };

  return (
    <AppLayout title="Browse Campaigns">
      {alert && <div style={{ marginBottom: 16 }}><Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} /></div>}
      <div className="section-header">
        <div>
          <h2 className="section-title">Available Campaigns</h2>
          <p className="text-secondary text-sm">Find campaigns that match your niche</p>
        </div>
      </div>

      {loading ? (
        <div className="grid-2">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : campaigns.length === 0 ? (
        <EmptyState icon={Megaphone} title="No campaigns available" desc="Check back later — brands are adding campaigns regularly" />
      ) : (
        <div className="grid-2">
          {campaigns.map(c => (
            <div key={c.id} className="card campaign-card">
              <div className="campaign-card-header">
                <div style={{ flex: 1 }}>
                  <div className="campaign-card-title">{c.title}</div>
                  <div className="text-secondary text-sm" style={{ marginTop: 2 }}>{c.brandName}</div>
                  <div className="campaign-card-meta" style={{ marginTop: 8 }}>
                    {(c.nicheRequired || []).map(n => <span key={n} className="chip">{n}</span>)}
                  </div>
                </div>
                {c.applicationStatus && <Badge status={c.applicationStatus} />}
              </div>

              <p className="text-secondary text-sm" style={{ lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                {c.requirements}
              </p>

              <div className="campaign-card-footer">
                <span className="payment-range">₹{Number(c.paymentMin).toLocaleString()}–₹{Number(c.paymentMax).toLocaleString()}</span>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={!!c.applicationStatus || applying === c.id}
                  onClick={() => apply(c.id)}>
                  {applying === c.id ? '...' : c.applicationStatus ? 'Applied' : <><Zap size={14} /> Apply</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
