import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, Megaphone, Star, Building2,
  LogOut, Briefcase, FileCheck, HelpCircle, Phone, Mail, X,
  Sun, Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/creators', label: 'Creators', icon: Star },
  { to: '/admin/brands', label: 'Brands', icon: Building2 },
  { to: '/admin/campaigns', label: 'Campaigns', icon: Megaphone },
];

const brandNav = [
  { to: '/brand', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/brand/campaigns', label: 'My Campaigns', icon: Megaphone },
  { to: '/brand/campaigns/new', label: 'Create Campaign', icon: Briefcase },
];

const creatorNav = [
  { to: '/creator', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/creator/campaigns', label: 'Browse Campaigns', icon: Megaphone },
  { to: '/creator/applications', label: 'My Applications', icon: FileCheck },
];

export default function AppLayout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [helpOpen, setHelpOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navMap = { admin: adminNav, brand: brandNav, creator: creatorNav };
  const nav = navMap[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <Link to="/" className="sidebar-logo">
          ⚡ <span>Collab</span>rix
        </Link>
        <nav className="sidebar-nav">
          {nav.map(({ to, label, icon: Icon }) => {
            const exact = to === '/admin' || to === '/brand' || to === '/creator';
            const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);
            return (
              <Link key={to} to={to} className={`sidebar-item${isActive ? ' active' : ''}`}>
                <Icon className="icon" size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {/* User info */}
          <div className="flex items-center gap-3" style={{ marginBottom: 14, padding: '6px 4px' }}>
            <div className="avatar">{initials}</div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div className="text-sm font-semibold truncate">{user?.name}</div>
              <div className="text-xs text-secondary truncate" style={{ textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>

          {/* Help Button */}
          <button className="sidebar-item" onClick={() => setHelpOpen(true)}
            style={{ color: 'var(--primary)', marginBottom: 8 }}>
            <HelpCircle size={18} />
            Help &amp; Support
          </button>

          {/* Logout Button — full red button */}
          <button
            className="btn btn-danger btn-full"
            onClick={handleLogout}
            style={{ justifyContent: 'center', gap: 8 }}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-wrapper">
        <header className="topbar">
          <h1 className="topbar-title">{title}</h1>
          <div className="topbar-right">
            {/* Help button in topbar */}
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setHelpOpen(true)}
              title="Help & Support">
              <HelpCircle size={15} />
              Help
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={toggleTheme}
              title="Toggle Theme">
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <div className="badge badge-secondary" style={{ textTransform: 'capitalize' }}>{user?.role}</div>
            <div className="avatar">{initials}</div>
            {/* Topbar logout button */}
            <button
              className="btn btn-danger btn-sm"
              onClick={handleLogout}
              title="Logout">
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </header>
        <main className="page-content fade-in">{children}</main>
      </div>

      {/* ===== HELP MODAL ===== */}
      {helpOpen && (
        <div className="modal-overlay" onClick={() => setHelpOpen(false)}>
          <div className="modal slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'var(--primary-light)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 className="modal-title">Help &amp; Support</h3>
                  <p className="text-xs text-secondary">We're here to help you 24/7</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setHelpOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p className="text-secondary text-sm" style={{ marginBottom: 20, lineHeight: 1.7 }}>
                Facing an issue or have a question? Reach out to the Collabrix support team — we're happy to help!
              </p>

              {/* Phone card */}
              <a href="tel:1234567890" style={{ textDecoration: 'none', display: 'block', marginBottom: 12 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 12,
                  background: 'var(--success-light)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'var(--success)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Phone size={20} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3, fontWeight: 500 }}>
                      📞 Call us at
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--success)', letterSpacing: 0.5 }}>
                      +91 1234567890
                    </div>
                  </div>
                </div>
              </a>

              {/* Email card */}
              <a href="mailto:collabrix@gmail.com" style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 12,
                  background: 'var(--primary-light)',
                  border: '1px solid rgba(37,99,235,0.3)',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Mail size={20} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3, fontWeight: 500 }}>
                      ✉️ Email us at
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--primary)' }}>
                      collabrix@gmail.com
                    </div>
                  </div>
                </div>
              </a>

              <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }} />
              <p className="text-xs text-secondary" style={{ textAlign: 'center' }}>
                🕘 Support hours: Mon – Sat, 9 AM – 7 PM IST
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
