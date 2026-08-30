import { useEffect, useState } from 'react';
import { api } from '../services/api';

const STATUS_OPTIONS = ['Applied', 'Assessment', 'Interview', 'Rejected', 'Selected'];
const STATUS_COLORS = {
  Applied: 'var(--info)',
  Assessment: 'var(--warning)',
  Interview: 'var(--accent-purple)',
  Rejected: 'var(--error)',
  Selected: 'var(--success)',
};
const STATUS_ICONS = {
  Applied: '📤',
  Assessment: '📝',
  Interview: '🎙️',
  Rejected: '❌',
  Selected: '✅',
};

function AddForm({ onAdd }) {
  const [form, setForm] = useState({ company: '', role: '', status: 'Applied', notes: '' });
  const [loading, setLoading] = useState(false);

  function onChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.company || !form.role) return;
    setLoading(true);
    try {
      await onAdd({ ...form, appliedAt: new Date().toISOString() });
      setForm({ company: '', role: '', status: 'Applied', notes: '' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass-card-static" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
      <h3 style={{ marginBottom: 'var(--space-4)' }}>+ Track New Application</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 'var(--space-4)', alignItems: 'end', flexWrap: 'wrap' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="app-company">Company</label>
          <input id="app-company" className="form-input" name="company" placeholder="e.g. Google" value={form.company} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="app-role">Role</label>
          <input id="app-role" className="form-input" name="role" placeholder="e.g. Data Scientist" value={form.role} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="app-status">Status</label>
          <select id="app-status" className="form-input" name="status" value={form.status} onChange={onChange}>
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group" style={{ marginTop: 'var(--space-3)' }}>
        <label className="form-label" htmlFor="app-notes">Notes (optional)</label>
        <input id="app-notes" className="form-input" name="notes" placeholder="e.g. Applied via LinkedIn, referral from Sarah" value={form.notes} onChange={onChange} />
      </div>
      <button id="add-application-btn" type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 'var(--space-4)' }}>
        {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Adding…</> : '+ Add Application'}
      </button>
    </form>
  );
}

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  // Load from server or localStorage fallback
  useEffect(() => {
    api.getApplications()
      .then(data => setApps(Array.isArray(data) ? data : data.applications || []))
      .catch(() => {
        const saved = localStorage.getItem('cm_applications');
        if (saved) setApps(JSON.parse(saved));
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(appData) {
    const newApp = { ...appData, id: Date.now().toString() };
    const updated = [newApp, ...apps];
    setApps(updated);
    localStorage.setItem('cm_applications', JSON.stringify(updated));
    try { await api.addApplication(newApp); } catch {}
  }

  async function handleStatusChange(id, status) {
    const updated = apps.map(a => a.id === id ? { ...a, status } : a);
    setApps(updated);
    localStorage.setItem('cm_applications', JSON.stringify(updated));
    try { await api.updateApplication(id, status); } catch {}
  }

  function handleDelete(id) {
    const updated = apps.filter(a => a.id !== id);
    setApps(updated);
    localStorage.setItem('cm_applications', JSON.stringify(updated));
  }

  const filtered = filter === 'All' ? apps : apps.filter(a => a.status === filter);

  // Stats
  const stats = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = apps.filter(a => a.status === s).length;
    return acc;
  }, {});

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: 'var(--space-8) var(--space-6)' }}>
        <div className="animate-fade-in-up">
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <h1 style={{ marginBottom: 'var(--space-2)' }}>Application Tracker</h1>
            <p>Track your job applications and monitor your progress through the hiring pipeline.</p>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
            <div className="glass-card-static" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{apps.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total</div>
            </div>
            {STATUS_OPTIONS.map(s => (
              <div key={s} className="glass-card-static" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 2 }}>{STATUS_ICONS[s]}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: STATUS_COLORS[s] }}>{stats[s] || 0}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s}</div>
              </div>
            ))}
          </div>

          {/* Add Form */}
          <AddForm onAdd={handleAdd} />

          {/* Filter */}
          <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
            {['All', ...STATUS_OPTIONS].map(s => (
              <button key={s} className={`tab-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                {s === 'All' ? 'All' : `${STATUS_ICONS[s]} ${s}`}
              </button>
            ))}
          </div>

          {/* Applications List */}
          {loading ? (
            <div className="flex justify-center" style={{ padding: 'var(--space-8)' }}>
              <span className="spinner" style={{ width: 36, height: 36 }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-card-static" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📭</div>
              <h3>No applications {filter !== 'All' ? `with status "${filter}"` : 'yet'}</h3>
              <p>Add your first application using the form above.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {filtered.map(app => (
                <div key={app.id} className="glass-card" style={{ padding: 'var(--space-5)' }}>
                  <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>{app.company}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>·</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{app.role}</span>
                        {app.appliedAt && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {app.notes && (
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{app.notes}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Status Selector */}
                      <select
                        className="form-input"
                        style={{ width: 'auto', padding: 'var(--space-2) var(--space-3)', fontSize: '0.85rem', color: STATUS_COLORS[app.status] }}
                        value={app.status}
                        onChange={e => handleStatusChange(app.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                      </select>

                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--error)', fontSize: '1.1rem', padding: 'var(--space-2)' }}
                        onClick={() => handleDelete(app.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
