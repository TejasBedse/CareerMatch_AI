import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, saveAuth } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function onChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await api.login(form.email, form.password);
      saveAuth(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrapper flex items-center justify-center" style={{ padding: 'var(--space-6)' }}>
      <div className="orb orb-purple" style={{ width: 400, height: 400, top: '10%', left: '10%' }} />
      <div className="orb orb-pink" style={{ width: 300, height: 300, bottom: '10%', right: '10%' }} />

      <div className="glass-card animate-fade-in-up" style={{ padding: 'var(--space-10)', maxWidth: 440, width: '100%', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>⚡</div>
          <h2 style={{ marginBottom: 'var(--space-2)' }}>Welcome back</h2>
          <p style={{ fontSize: '0.95rem' }}>Sign in to continue your career journey</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 'var(--space-5)' }}>{error}</div>}

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input id="login-email" className="form-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={onChange} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input id="login-password" className="form-input" type="password" name="password" placeholder="••••••••" value={form.password} onChange={onChange} required />
          </div>
          <button id="login-submit-btn" type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
            {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Signing In…</> : 'Sign In →'}
          </button>
        </form>

        <div className="divider" />
        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>Create one free</Link>
        </p>
      </div>
    </div>
  );
}
