import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, saveAuth } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function onChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const { token, user } = await api.register(form.name, form.email, form.password);
      saveAuth(token, user);
      navigate('/resume');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrapper flex items-center justify-center" style={{ padding: 'var(--space-6)' }}>
      <div className="orb orb-purple" style={{ width: 400, height: 400, top: '10%', right: '10%' }} />
      <div className="orb orb-cyan" style={{ width: 300, height: 300, bottom: '10%', left: '10%' }} />

      <div className="glass-card animate-fade-in-up" style={{ padding: 'var(--space-10)', maxWidth: 460, width: '100%', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>🚀</div>
          <h2 style={{ marginBottom: 'var(--space-2)' }}>Create Your Account</h2>
          <p style={{ fontSize: '0.95rem' }}>Start matching smarter. It's completely free.</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 'var(--space-5)' }}>{error}</div>}

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input id="reg-name" className="form-input" type="text" name="name" placeholder="Alex Johnson" value={form.name} onChange={onChange} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <input id="reg-email" className="form-input" type="email" name="email" placeholder="alex@example.com" value={form.email} onChange={onChange} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input id="reg-password" className="form-input" type="password" name="password" placeholder="Min. 6 characters" value={form.password} onChange={onChange} required />
          </div>
          <button id="register-submit-btn" type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
            {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Creating Account…</> : 'Create Account →'}
          </button>
        </form>

        <div className="divider" />
        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
