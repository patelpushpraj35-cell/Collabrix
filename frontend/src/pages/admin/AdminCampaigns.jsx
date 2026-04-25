import { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { LoadingCenter, Badge, EmptyState } from '../../components/UI';
import api from '../../lib/api';
import { Megaphone } from 'lucide-react';

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/campaigns').then(r => setCampaigns(r.data.campaigns)).finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout title="Campaigns">
      <div className="section-header">
        <div>
          <h2 className="section-title">All Campaigns</h2>
          <p className="text-secondary text-sm">{campaigns.length} total campaigns</p>
        </div>
      </div>
      {loading ? <LoadingCenter /> : campaigns.length === 0 ? (
        <EmptyState icon={Megaphone} title="No campaigns yet" desc="Campaigns created by brands will appear here" />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Title</th><th>Brand</th><th>Niches</th><th>Payment</th><th>Applicants</th><th>Selected</th><th>Status</th><th>Created</th></tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id}>
                  <td><span style={{ fontWeight: 600 }}>{c.title}</span></td>
                  <td className="text-secondary">{c.brand?.userName || c.brand?.companyName || '—'}</td>
                  <td>
                    <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                      {(c.nicheRequired || []).slice(0, 2).map(n => <span key={n} className="chip">{n}</span>)}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--success)' }}>
                    ₹{Number(c.paymentMin).toLocaleString()} – ₹{Number(c.paymentMax).toLocaleString()}
                  </td>
                  <td>{(c.applicants || []).length}</td>
                  <td>{(c.selectedCreators || []).length}</td>
                  <td><Badge status={c.status || 'active'} /></td>
                  <td className="text-secondary text-sm">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
