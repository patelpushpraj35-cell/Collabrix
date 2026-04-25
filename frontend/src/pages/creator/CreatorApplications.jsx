import { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { LoadingCenter, EmptyState, Badge, Alert, Modal, Spinner } from '../../components/UI';
import api from '../../lib/api';
import { FileCheck, Upload } from 'lucide-react';

export default function CreatorApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [proof, setProof] = useState({ proofUrl: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [tab, setTab] = useState('all');

  const load = () => {
    setLoading(true);
    api.get('/creators/applications').then(r => setApplications(r.data.applications)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submitProof = async () => {
    setSubmitting(true);
    try {
      await api.post(`/creators/tasks/${selectedApp.task.id}/submit`, proof);
      setAlert({ type: 'success', msg: 'Proof submitted successfully!' });
      setSelectedApp(null);
      load();
    } catch { setAlert({ type: 'error', msg: 'Failed to submit proof' }); }
    finally { setSubmitting(false); }
  };

  const tabs = ['all', 'pending', 'accepted', 'rejected'];
  const filtered = tab === 'all' ? applications : applications.filter(a => a.status === tab);

  return (
    <AppLayout title="My Applications">
      {alert && <div style={{ marginBottom: 16 }}><Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} /></div>}

      <div className="section-header">
        <div>
          <h2 className="section-title">Applications</h2>
          <p className="text-secondary text-sm">{applications.length} total applications</p>
        </div>
      </div>

      <div className="tab-nav">
        {tabs.map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>
            {t} ({t === 'all' ? applications.length : applications.filter(a => a.status === t).length})
          </button>
        ))}
      </div>

      {loading ? <LoadingCenter /> : filtered.length === 0 ? (
        <EmptyState icon={FileCheck} title="No applications" desc="Your applications will appear here" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(a => (
            <div key={a.id} className="card campaign-card">
              <div className="campaign-card-header">
                <div style={{ flex: 1 }}>
                  <div className="campaign-card-title">{a.campaign?.title}</div>
                  <div className="text-secondary text-sm">{a.campaign?.brandName}</div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(a.campaign?.nicheRequired || []).map(n => <span key={n} className="chip">{n}</span>)}
                  </div>
                </div>
                <Badge status={a.status} />
              </div>

              {a.status === 'accepted' && a.task && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 4 }}>
                  <h4 style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>📋 Task Details</h4>
                  <p className="text-secondary text-sm" style={{ lineHeight: 1.6, marginBottom: 12 }}>{a.task.taskDetails}</p>
                  <div className="grid-2" style={{ marginBottom: 12 }}>
                    <div className="text-sm"><span className="text-secondary">Contact: </span>{a.task.contactEmail}</div>
                    <div className="text-sm"><span className="text-secondary">UPI: </span>{a.task.upiId}</div>
                  </div>
                  {a.task.status === 'assigned' ? (
                    <button className="btn btn-primary btn-sm" onClick={() => { setSelectedApp(a); setProof({ proofUrl: '', notes: '' }); }}>
                      <Upload size={14} /> Submit Proof
                    </button>
                  ) : (
                    <Badge status={a.task.status} />
                  )}
                </div>
              )}

              <div style={{ marginTop: 8 }}>
                <span className="text-secondary text-xs">Applied {new Date(a.appliedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!selectedApp} onClose={() => setSelectedApp(null)} title="Submit Proof of Work"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setSelectedApp(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={submitProof} disabled={submitting}>
              {submitting ? <Spinner /> : 'Submit Proof'}
            </button>
          </>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group">
            <label className="input-label">Proof URL (post link, drive link, etc.)</label>
            <input className="input" type="url" placeholder="https://..."
              value={proof.proofUrl} onChange={e => setProof(p => ({ ...p, proofUrl: e.target.value }))} />
          </div>
          <div className="input-group">
            <label className="input-label">Notes / Additional Info</label>
            <textarea className="input" rows={3} placeholder="Any additional context..."
              value={proof.notes} onChange={e => setProof(p => ({ ...p, notes: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
