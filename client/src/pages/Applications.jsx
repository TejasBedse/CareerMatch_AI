import { useEffect, useState } from 'react';
import { api } from '../services/api';
import SectionImage from '../components/SectionImage';
import {
  IconBriefcase,
  IconBuilding,
  IconPlus,
  IconCheck,
  IconClock,
  IconAlertCircle,
  IconFilter
} from '../components/Icons';

const STATUS_OPTIONS = ['Applied', 'Assessment', 'Interview', 'Selected', 'Rejected'];

const STATUS_BADGES = {
  Applied: 'badge-neutral',
  Assessment: 'badge-warning',
  Interview: 'badge-brand',
  Selected: 'badge-success',
  Rejected: 'badge-error',
};

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ company: '', role: '', status: 'Applied', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [readiness, setReadiness] = useState(null);

  useEffect(() => {
    api.getApplications()
      .then((data) => setApps(Array.isArray(data) ? data : data.applications || []))
      .catch(() => {
        const saved = localStorage.getItem('cm_applications');
        if (saved) {
          try { setApps(JSON.parse(saved)); } catch (e) { setApps([]); }
        }
      })
      .finally(() => setLoading(false));
    api.getReadiness().then(setReadiness).catch(() => setReadiness(null));
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.company.trim() || !form.role.trim()) return;
    setSubmitting(true);
    try {
      const newApp = await api.addApplication({
        ...form,
        appliedAt: new Date().toISOString(),
      });
      const updated = [newApp, ...apps];
      setApps(updated);
      localStorage.setItem('cm_applications', JSON.stringify(updated));
      setForm({ company: '', role: '', status: 'Applied', notes: '' });
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(id, newStatus) {
    const updated = apps.map((a) => (a.id === id ? { ...a, status: newStatus } : a));
    setApps(updated);
    localStorage.setItem('cm_applications', JSON.stringify(updated));
    api.updateApplication(id, newStatus).catch(console.error);
  }

  const filtered = filter === 'All' ? apps : apps.filter((a) => a.status === filter);

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 1040 }}>

        {/* Header */}
        <div className="flex justify-between items-center" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="inline-flex items-center gap-2 badge badge-neutral" style={{ marginBottom: '0.35rem' }}>
              <IconBriefcase size={13} />
              <span>Pipeline Intelligence</span>
            </div>
            <h1>Job Application Tracker</h1>
            <p>Monitor your active technical job applications and interview lifecycle stages.</p>
            {readiness?.applicationReadiness && (
              <div style={{ marginTop: '0.75rem' }}>
                <span className={`badge ${readiness.applicationReadiness.decision === 'READY TO APPLY' ? 'badge-success' : readiness.applicationReadiness.decision === 'LOW MATCH' ? 'badge-error' : 'badge-warning'}`}>
                  {readiness.applicationReadiness.decision}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.6rem' }}>Decision support based on your current evidence</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <IconPlus size={15} />
            <span>{showAddForm ? 'Close Form' : 'Log New Application'}</span>
          </button>
        </div>

        <SectionImage
          src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=80"
          alt="A team meeting to review job opportunities and next steps"
          title="Application Pipeline"
        />

        {/* Quick Add Form Drawer */}
        {showAddForm && (
          <div className="pro-card animate-fade-in" style={{ marginBottom: '2rem' }}>
            <div className="pro-card-header">
              <h3 style={{ fontSize: '1.05rem' }}>Log Technical Job Application</h3>
            </div>
            <div className="pro-card-body">
              <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Stripe, OpenAI, Figma"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Role</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Senior Backend Engineer"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Initial Status</label>
                    <select
                      className="form-select"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes / Referral Details</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Applied via Ashby, employee referral from Marcus"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={submitting}
                  >
                    {submitting ? 'Adding…' : 'Save Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex gap-2" style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {['All', ...STATUS_OPTIONS].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setFilter(opt)}
              className={`btn ${filter === opt ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Applications Data Table */}
        <div className="pro-card">
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company & Role</th>
                  <th>Current Status</th>
                  <th>Notes</th>
                  <th>Applied Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                      No applications recorded under this filter. Click "Log New Application" to add one.
                    </td>
                  </tr>
                ) : (
                  filtered.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="kpi-icon-box" style={{ width: 32, height: 32 }}>
                            <IconBuilding size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{app.role}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.company}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          className="form-select"
                          style={{
                            padding: '0.25rem 0.6rem',
                            fontSize: '0.78rem',
                            width: 'auto',
                            display: 'inline-block',
                          }}
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ fontSize: '0.84rem' }}>
                        {app.notes || '—'}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recent'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
