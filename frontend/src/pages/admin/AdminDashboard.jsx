import { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { LoadingCenter, Badge } from '../../components/UI';
import api from '../../lib/api';
import { Users, Star, Building2, Megaphone, Clock, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <AppLayout title="Admin Dashboard"><LoadingCenter /></AppLayout>;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'var(--primary)', bg: 'var(--primary-light)' },
    { label: 'Pending Approvals', value: stats.pendingUsers, icon: Clock, color: 'var(--warning)', bg: 'var(--warning-light)' },
    { label: 'Creators', value: stats.totalCreators, icon: Star, color: 'var(--success)', bg: 'var(--success-light)' },
    { label: 'Brands', value: stats.totalBrands, icon: Building2, color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
    { label: 'Campaigns', value: stats.totalCampaigns, icon: Megaphone, color: 'var(--primary)', bg: 'var(--primary-light)' },
    { label: 'Applications', value: stats.totalApplications, icon: TrendingUp, color: 'var(--success)', bg: 'var(--success-light)' },
  ];

  return (
    <AppLayout title="Admin Dashboard">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Platform Overview</h2>
        <p className="text-secondary text-sm">Live stats from your Collabrix platform</p>
      </div>
      <div className="grid-3" style={{ marginBottom: 32 }}>
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: bg, color }}>
                <Icon size={22} />
              </div>
              <div>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Quick Guide</h3>
        <p className="text-secondary text-sm" style={{ marginBottom: 16 }}>
          Navigate using the sidebar to manage users, creators, brands, and campaigns.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { emoji: '👥', text: 'Go to Users → Approve or reject pending accounts' },
            { emoji: '🎨', text: 'Go to Creators → View all creator profiles' },
            { emoji: '🏢', text: 'Go to Brands → View all brand profiles' },
            { emoji: '📢', text: 'Go to Campaigns → Monitor all active campaigns' },
          ].map(({ emoji, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: 18 }}>{emoji}</span> {text}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
