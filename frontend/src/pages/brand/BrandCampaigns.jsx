import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { LoadingCenter, EmptyState, Badge, Alert, Modal, Spinner } from '../../components/UI';
import api from '../../lib/api';
import { Megaphone, Trash2, Users } from 'lucide-react';

export default function BrandCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [taskModal, setTaskModal] = useState(null);
  const [taskForm, setTaskForm] = useState({ taskDetails: '', contactEmail: '', upiId: '' });
  const [taskSaving, setTaskSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/brand/campaigns').then(r => setCampaigns(r.data.campaigns)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openApplicants = async (c) => {
    setSelectedCampaign(c);
    setApplicantsLoading(true);
    try {
      const r = await api.get(`/brand/campaigns/${c.id}/applicants`);
      setApplicants(r.data.applicants);
    } finally { setApplicantsLoading(false); }
  };

  const updateStatus = async (appId, status) => {
    if (status === 'accepted') {
      setTaskModal({ appId, status });
      return;
    }
    try {
      await api.patch(`/brand/applications/${appId}/status`, { status });
      setAlert({ type: 'success', msg: 'Application rejected' });
      openApplicants(selectedCampaign);
    } catch { setAlert({ type: 'error', msg: 'Action failed' }); }
  };

  const handleAccept = async () => {
    setTaskSaving(true);
    try {
      await api.patch(`/brand/applications/${taskModal.appId}/status`, {
        status: 'accepted', ...taskForm,
      });
      setAlert({ type: 'success', msg: 'Creator accepted & task assigned!' });
      setTaskModal(null);
      setTaskForm({ taskDetails: '', contactEmail: '', upiId: '' });
      openApplicants(selectedCampaign);
    } catch { setAlert({ type: 'error', msg: 'Failed to accept' }); }
    finally { setTaskSaving(false); }
  };

  const deleteCampaign = async (id) => {
    if (!confirm('Delete this campaign?')) return;
    try {
      await api.delete(`/brand/campaigns/${id}`);
      setAlert({ type: 'success', msg: 'Campaign deleted' });
      load();
    } catch { setAlert({ type: 'error', msg: 'Failed to delete' }); }
  };

  return (
    <AppLayout title="My Campaigns">
      {alert && <div style={{ marginBottom: 16 }}><Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} /></div>}

      <div className="section-header">
        <div>
          <h2 className="section-title">Campaigns</h2>
          <p className="text-secondary text-sm">{campaigns.length} campaigns</p>
        </div>
        <Link to="/brand/campaigns/new" className="btn btn-primary">+ New Campaign</Link>
      </div>

      {loading ? <LoadingCenter /> : campaigns.length === 0 ? (
        <EmptyState icon={Megaphone} title="No campaigns yet"
          action={<Link to="/brand/campaigns/new" className="btn btn-primary">Create Campaign</Link>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {campaigns.map(c => (
            <div key={c.id} className="card campaign-card">
              <div className="campaign-card-header">
                <div style={{ flex: 1 }}>
                  <div className="campaign-card-title">{c.title}</div>
                  <div className="campaign-card-meta">
                    {(c.nicheRequired || []).map(n => <span key={n} className="chip">{n}</span>)}
                  </div>
                  <p className="text-secondary text-sm" style={{ marginTop: 8, lineHeight: 1.5 }}>{c.requirements}</p>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => deleteCampaign(c.id)}><Trash2 size={14} /></button>
              </div>
              <div className="campaign-card-footer">
                <span className="payment-range">₹{Number(c.paymentMin).toLocaleString()}–₹{Number(c.paymentMax).toLocaleString()}</span>
                <button className="btn btn-secondary btn-sm" onClick={() => openApplicants(c)}>
                  <Users size={14} /> {c.applicantCount} Applicants
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Applicants Modal */}
      <Modal open={!!selectedCampaign} onClose={() => setSelectedCampaign(null)} title={`Applicants – ${selectedCampaign?.title}`}>
        {applicantsLoading ? <div className="loading-center"><Spinner size="lg" /></div> : (
          applicants.length === 0 ? (
            <p className="text-secondary text-sm">No applicants yet for this campaign.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {applicants.map(a => (
                <div key={a.applicationId} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="avatar" style={{ width: 44, height: 44, fontSize: 15 }}>
                    {a.creator?.name?.[0] || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{a.creator?.name}</div>
                    <div className="text-secondary text-sm">{(a.creator?.niche || []).join(', ')}</div>
                    <div className="text-secondary text-sm">{Number(a.creator?.followers || 0).toLocaleString()} followers</div>
                  </div>
                  <Badge status={a.status} />
                  {a.status === 'pending' && (
                    <div className="flex gap-2">
                      <button className="btn btn-success btn-sm" onClick={() => updateStatus(a.applicationId, 'accepted')}>Accept</button>
                      <button className="btn btn-danger btn-sm" onClick={() => updateStatus(a.applicationId, 'rejected')}>Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </Modal>

      {/* Task Assignment Modal */}
      <Modal open={!!taskModal} onClose={() => setTaskModal(null)} title="Accept & Assign Task"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setTaskModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAccept} disabled={taskSaving}>
              {taskSaving ? <Spinner /> : 'Accept & Send Task'}
            </button>
          </>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="input-group">
            <label className="input-label">Task Details / Deliverables</label>
            <textarea className="input" placeholder="Describe what the creator needs to deliver..." rows={4}
              value={taskForm.taskDetails} onChange={e => setTaskForm(f => ({ ...f, taskDetails: e.target.value }))} />
          </div>
          <div className="input-group">
            <label className="input-label">Email for Proof Submission</label>
            <input className="input" type="email" placeholder="campaigns@yourbrand.com"
              value={taskForm.contactEmail} onChange={e => setTaskForm(f => ({ ...f, contactEmail: e.target.value }))} />
          </div>
          <div className="input-group">
            <label className="input-label">UPI ID for Payment</label>
            <input className="input" placeholder="brand@upi"
              value={taskForm.upiId} onChange={e => setTaskForm(f => ({ ...f, upiId: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
