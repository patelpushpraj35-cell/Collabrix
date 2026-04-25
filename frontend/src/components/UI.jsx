import { X, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

export function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;
  const map = {
    success: { cls: 'alert-success', Icon: CheckCircle },
    error: { cls: 'alert-error', Icon: AlertCircle },
    warning: { cls: 'alert-warning', Icon: AlertTriangle },
  };
  const { cls, Icon } = map[type] || map.error;
  return (
    <div className={`alert ${cls}`} style={{ justifyContent: 'space-between' }}>
      <div className="flex items-center gap-2">
        <Icon size={16} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex' }}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export function Spinner({ size = 'sm' }) {
  return <div className={`spinner${size === 'lg' ? ' spinner-lg' : ''}`} />;
}

export function LoadingCenter() {
  return <div className="loading-center"><Spinner size="lg" /></div>;
}

export function Badge({ status }) {
  const map = {
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-danger',
    active: 'badge-success',
    inactive: 'badge-secondary',
    accepted: 'badge-success',
    submitted: 'badge-primary',
    completed: 'badge-success',
    assigned: 'badge-warning',
  };
  return <span className={`badge ${map[status] || 'badge-secondary'}`}>{status}</span>;
}

export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal slide-up">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{Icon && <Icon size={48} />}</div>
      <h3>{title}</h3>
      {desc && <p>{desc}</p>}
      {action}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="skeleton" style={{ height: 20, width: '60%' }} />
      <div className="skeleton" style={{ height: 14, width: '90%' }} />
      <div className="skeleton" style={{ height: 14, width: '75%' }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <div className="skeleton" style={{ height: 32, width: 80, borderRadius: 12 }} />
        <div className="skeleton" style={{ height: 32, width: 80, borderRadius: 12 }} />
      </div>
    </div>
  );
}
