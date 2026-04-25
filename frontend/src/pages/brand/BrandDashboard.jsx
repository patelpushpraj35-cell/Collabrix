import { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { LoadingCenter, EmptyState, Badge } from '../../components/UI';
import api from '../../lib/api';
import { Megaphone, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BrandDashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/brand/campaigns').then(r => setCampaigns(r.data.campaigns)).finally(() => setLoading(false));
  }, []);

  const totalApplicants = campaigns.reduce((s, c) => s + (c.applicantCount || 0), 0);
  const totalSelected = campaigns.reduce((s, c) => s + (c.selectedCount || 0), 0);

  return (
    <AppLayout title="Brand Dashboard">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Welcome back!</h2>
        <p className="text-secondary text-sm">Here's your campaign overview</p>
      </div>

      <div className="grid-3" style={{ marginBottom: 32 }}>
        {[
          { label: 'Active Campaigns', value: campaigns.length, icon: Megaphone, color: 'var(--primary)', bg: 'var(--primary-light)' },
          { label: 'Total Applicants', value: totalApplicants, icon: Users, color: 'var(--warning)', bg: 'var(--warning-light)' },
          { label: 'Selected Creators', value: totalSelected, icon: TrendingUp, color: 'var(--success)', bg: 'var(--success-light)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: bg, color }}><Icon size={22} /></div>
              <div>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="section-header">
        <h3 className="section-title">Recent Campaigns</h3>
        <Link to="/brand/campaigns/new" className="btn btn-primary btn-sm">+ New Campaign</Link>
      </div>

      {loading ? <LoadingCenter /> : campaigns.length === 0 ? (
        <EmptyState icon={Megaphone} title="No campaigns yet"
          desc="Create your first campaign to start collaborating with creators"
          action={<Link to="/brand/campaigns/new" className="btn btn-primary">Create Campaign</Link>} />
      ) : (
        <div className="grid-2">
          {campaigns.slice(0, 4).map(c => (
            <Link key={c.id} to="/brand/campaigns" style={{ textDecoration: 'none' }}>
              <div className="card card-hover campaign-card">
                <div className="campaign-card-header">
                  <div>
                    <div className="campaign-card-title">{c.title}</div>
                    <div className="campaign-card-meta">
                      {(c.nicheRequired || []).slice(0, 2).map(n => <span key={n} className="chip">{n}</span>)}
                    </div>
                  </div>
                  <Badge status={c.status || 'active'} />
                </div>
                <div className="campaign-card-footer">
                  <span className="payment-range">₹{Number(c.paymentMin).toLocaleString()}–{Number(c.paymentMax).toLocaleString()}</span>
                  <span className="text-secondary text-sm">{c.applicantCount} applicants</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
