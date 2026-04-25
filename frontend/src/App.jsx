import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoadingCenter } from './components/UI';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PendingPage from './pages/PendingPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCreators from './pages/admin/AdminCreators';
import AdminBrands from './pages/admin/AdminBrands';
import AdminCampaigns from './pages/admin/AdminCampaigns';

// Brand pages
import BrandDashboard from './pages/brand/BrandDashboard';
import BrandCampaigns from './pages/brand/BrandCampaigns';
import CreateCampaign from './pages/brand/CreateCampaign';

// Creator pages
import CreatorDashboard from './pages/creator/CreatorDashboard';
import CreatorCampaigns from './pages/creator/CreatorCampaigns';
import CreatorApplications from './pages/creator/CreatorApplications';

// Route guards
function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingCenter />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingCenter />;
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'brand') return <Navigate to="/brand" replace />;
    return <Navigate to="/creator" replace />;
  }
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingCenter />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'brand') return <Navigate to="/brand" replace />;
  return <Navigate to="/creator" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Root */}
            <Route path="/" element={<RootRedirect />} />

            {/* Public */}
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/pending" element={<PendingPage />} />


            {/* Admin */}
            <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
            <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><AdminUsers /></PrivateRoute>} />
            <Route path="/admin/creators" element={<PrivateRoute roles={['admin']}><AdminCreators /></PrivateRoute>} />
            <Route path="/admin/brands" element={<PrivateRoute roles={['admin']}><AdminBrands /></PrivateRoute>} />
            <Route path="/admin/campaigns" element={<PrivateRoute roles={['admin']}><AdminCampaigns /></PrivateRoute>} />

            {/* Brand */}
            <Route path="/brand" element={<PrivateRoute roles={['brand']}><BrandDashboard /></PrivateRoute>} />
            <Route path="/brand/campaigns" element={<PrivateRoute roles={['brand']}><BrandCampaigns /></PrivateRoute>} />
            <Route path="/brand/campaigns/new" element={<PrivateRoute roles={['brand']}><CreateCampaign /></PrivateRoute>} />

            {/* Creator */}
            <Route path="/creator" element={<PrivateRoute roles={['creator']}><CreatorDashboard /></PrivateRoute>} />
            <Route path="/creator/campaigns" element={<PrivateRoute roles={['creator']}><CreatorCampaigns /></PrivateRoute>} />
            <Route path="/creator/applications" element={<PrivateRoute roles={['creator']}><CreatorApplications /></PrivateRoute>} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
