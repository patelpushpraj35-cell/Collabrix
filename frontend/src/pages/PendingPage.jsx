import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock } from 'lucide-react';

export default function PendingPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="pending-screen">
      <div className="pending-icon"><Clock size={36} /></div>
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Account Pending Approval</h2>
        <p className="text-secondary" style={{ maxWidth: 400 }}>
          Your account has been submitted for review. Our admin team will verify and approve
          your account within 24 hours. You'll be able to log in once approved.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button className="btn btn-primary" onClick={() => { logout(); navigate('/login'); }}>
          Back to Login
        </button>
      </div>
      <p className="text-secondary text-xs" style={{ marginTop: 8 }}>
        Questions? Contact support@collabrix.io
      </p>
    </div>
  );
}
