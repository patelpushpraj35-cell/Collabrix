import { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { LoadingCenter, Badge, Alert, EmptyState, Modal } from '../../components/UI';
import api from '../../lib/api';
import { Users, Check, X, Eye } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [alert, setAlert] = useState(null);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/admin/users').then(r => setUsers(r.data.users)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/users/${id}/status`, { status });
      setAlert({ type: 'success', msg: `User ${status} successfully` });
      load();
    } catch { setAlert({ type: 'error', msg: 'Failed to update status' }); }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const filtered = filter === 'all' ? users : users.filter(u => u.status === filter);

  return (
    <AppLayout title="User Management">
      {alert && (
        <div style={{ marginBottom: 16 }}>
          <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />
        </div>
      )}

      <div className="section-header">
        <div>
          <h2 className="section-title">All Users</h2>
          <p className="text-secondary text-sm">{users.length} registered users</p>
        </div>
        <div className="flex gap-2">
          {['all','pending','approved','rejected'].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingCenter /> : (
        filtered.length === 0 ? (
          <EmptyState icon={Users} title="No users found" desc="No users match this filter" />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Role</th>
                  <th>Status</th><th>Joined</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td><span style={{ fontWeight: 600 }}>{u.name}</span></td>
                    <td className="text-secondary">{u.email}</td>
                    <td><span className="badge badge-secondary" style={{ textTransform: 'capitalize' }}>{u.role}</span></td>
                    <td><Badge status={u.status} /></td>
                    <td className="text-secondary text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        {u.role !== 'admin' && (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleViewDetails(u)}>
                            <Eye size={14} /> Details
                          </button>
                        )}
                        {u.role !== 'admin' && u.status !== 'approved' && (
                          <button className="btn btn-success btn-sm" onClick={() => updateStatus(u.id, 'approved')}>
                            <Check size={14} /> Approve
                          </button>
                        )}
                        {u.role !== 'admin' && u.status !== 'rejected' && (
                          <button className="btn btn-danger btn-sm" onClick={() => updateStatus(u.id, 'rejected')}>
                            <X size={14} /> Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {selectedUser && (
        <Modal open={showModal} onClose={() => setShowModal(false)} title={`${selectedUser.name}'s Details`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ background: 'var(--bg)' }}>
              <h4 style={{ marginBottom: 12, fontWeight: 600 }}>Basic Information</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><strong className="text-secondary">Name:</strong> {selectedUser.name}</div>
                <div><strong className="text-secondary">Email:</strong> {selectedUser.email}</div>
                <div><strong className="text-secondary">Mobile:</strong> {selectedUser.mobile}</div>
                <div><strong className="text-secondary">Role:</strong> <span style={{textTransform: 'capitalize'}}>{selectedUser.role}</span></div>
                <div><strong className="text-secondary">Status:</strong> <Badge status={selectedUser.status} /></div>
              </div>
            </div>

            {selectedUser.role === 'creator' && selectedUser.details && (
              <div className="card" style={{ background: 'var(--bg)' }}>
                <h4 style={{ marginBottom: 12, fontWeight: 600 }}>Creator Profile</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <strong className="text-secondary">Niches:</strong>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                      {selectedUser.details.niche?.map(n => <span key={n} className="chip">{n}</span>)}
                    </div>
                  </div>
                  <div>
                    <strong className="text-secondary">Platforms:</strong>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                      {selectedUser.details.platforms?.map(p => <span key={p} className="chip" style={{textTransform: 'capitalize'}}>{p}</span>)}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <div><strong className="text-secondary">Followers:</strong> {selectedUser.details.followers?.toLocaleString() || 0}</div>
                    <div><strong className="text-secondary">Avg Views:</strong> {selectedUser.details.avgViews?.toLocaleString() || 0}</div>
                    <div><strong className="text-secondary">Avg Likes:</strong> {selectedUser.details.avgLikes?.toLocaleString() || 0}</div>
                  </div>
                  <div><strong className="text-secondary">Content Type:</strong> <span style={{textTransform: 'capitalize'}}>{selectedUser.details.contentType}</span></div>
                  <div><strong className="text-secondary">Channel:</strong> <a href={selectedUser.details.channelUrl} target="_blank" rel="noreferrer" style={{color: 'var(--primary)'}}>{selectedUser.details.channelUrl}</a></div>
                </div>
              </div>
            )}

            {selectedUser.role === 'brand' && selectedUser.details && (
              <div className="card" style={{ background: 'var(--bg)' }}>
                <h4 style={{ marginBottom: 12, fontWeight: 600 }}>Brand Profile</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><strong className="text-secondary">Company Name:</strong> {selectedUser.details.companyName}</div>
                  <div><strong className="text-secondary">Valuation:</strong> ₹{selectedUser.details.valuation?.toLocaleString() || 0}</div>
                </div>
              </div>
            )}
            
            {selectedUser.status === 'pending' && (
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button className="btn btn-success flex-1" onClick={() => { updateStatus(selectedUser.id, 'approved'); setShowModal(false); }}>
                  <Check size={16} /> Approve Account
                </button>
                <button className="btn btn-danger flex-1" onClick={() => { updateStatus(selectedUser.id, 'rejected'); setShowModal(false); }}>
                  <X size={16} /> Reject Account
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
