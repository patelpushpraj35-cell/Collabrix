import { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { LoadingCenter, Badge, EmptyState } from '../../components/UI';
import api from '../../lib/api';
import { Star } from 'lucide-react';

export default function AdminCreators() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/creators').then(r => setCreators(r.data.creators)).finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout title="Creators">
      <div className="section-header">
        <div>
          <h2 className="section-title">All Creators</h2>
          <p className="text-secondary text-sm">{creators.length} creator profiles</p>
        </div>
      </div>
      {loading ? <LoadingCenter /> : creators.length === 0 ? (
        <EmptyState icon={Star} title="No creators yet" desc="Creators will appear here once they complete their profile" />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Niches</th><th>Platforms</th><th>Followers</th><th>Avg Views</th><th>Status</th></tr>
            </thead>
            <tbody>
              {creators.map(c => (
                <tr key={c.id}>
                  <td><span style={{ fontWeight: 600 }}>{c.user?.name || '—'}</span></td>
                  <td className="text-secondary">{c.user?.email}</td>
                  <td>
                    <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                      {(c.niche || []).slice(0, 3).map(n => <span key={n} className="chip">{n}</span>)}
                      {c.niche?.length > 3 && <span className="chip">+{c.niche.length - 3}</span>}
                    </div>
                  </td>
                  <td className="text-secondary">{(c.platforms || []).join(', ')}</td>
                  <td style={{ fontWeight: 600 }}>{Number(c.followers || 0).toLocaleString()}</td>
                  <td className="text-secondary">{Number(c.avgViews || 0).toLocaleString()}</td>
                  <td><Badge status={c.user?.status || 'pending'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
