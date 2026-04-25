import { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { LoadingCenter, Badge, EmptyState } from '../../components/UI';
import api from '../../lib/api';
import { Star, Megaphone, FileCheck, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function CreatorDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/creators/profile').catch(() => ({ data: { creator: null } })),
      api.get('/creators/applications').catch(() => ({ data: { applications: [] } })),
    ]).then(([p, a]) => {
      setProfile(p.data.creator);
      setApplications(a.data.applications);
    }).finally(() => setLoading(false));
  }, []);

  const accepted = applications.filter(a => a.status === 'accepted').length;
  const pending = applications.filter(a => a.status === 'pending').length;

  if (loading) return <AppLayout title="Creator Dashboard"><LoadingCenter /></AppLayout>;

  return (
    <AppLayout title="Creator Dashboard">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          Hey {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-secondary text-sm">Here's your activity overview</p>
      </div>

      {!profile && (
        <div className="card" style={{ marginBottom: 24, border: '1px solid var(--warning)', background: 'var(--warning-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--warning)', marginBottom: 4 }}>⚠️ Profile Incomplete</div>
              <p className="text-secondary text-sm">Complete your creator profile to start applying for campaigns</p>
            </div>
            <Link to="/creator-onboard" className="btn btn-primary btn-sm">Complete Profile</Link>
          </div>
        </div>
      )}

      <div className="grid-3" style={{ marginBottom: 32 }}>
        {[
          { label: 'Total Applications', value: applications.length, icon: FileCheck, color: 'var(--primary)', bg: 'var(--primary-light)' },
          { label: 'Pending', value: pending, icon: TrendingUp, color: 'var(--warning)', bg: 'var(--warning-light)' },
          { label: 'Accepted', value: accepted, icon: Star, color: 'var(--success)', bg: 'var(--success-light)' },
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

      {profile && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Your Profile</h3>
          <div className="grid-3">
            {[
              { label: 'Followers', value: Number(profile.followers || 0).toLocaleString() },
              { label: 'Avg Views', value: Number(profile.avgViews || 0).toLocaleString() },
              { label: 'Avg Likes', value: Number(profile.avgLikes || 0).toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
                <div className="text-secondary text-sm">{label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(profile.niche || []).map(n => <span key={n} className="chip">{n}</span>)}
          </div>
        </div>
      )}

      <div className="section-header">
        <h3 className="section-title">Recent Applications</h3>
        <Link to="/creator/applications" className="btn btn-ghost btn-sm">View All →</Link>
      </div>

      {applications.length === 0 ? (
        <EmptyState icon={Megaphone} title="No applications yet"
          desc="Browse campaigns and apply to start collaborating"
          action={<Link to="/creator/campaigns" className="btn btn-primary">Browse Campaigns</Link>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {applications.slice(0, 4).map(a => (
            <div key={a.id} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{a.campaign?.title}</div>
                <div className="text-secondary text-sm">{a.campaign?.brandName}</div>
              </div>
              <Badge status={a.status} />
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
