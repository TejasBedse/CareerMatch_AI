import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, saveAuth } from '../services/api';
import careerMatchLogo from '../assets/career-match-logo-full.svg';
import {
  IconCpu,
  IconAlertCircle,
  IconArrowRight,
  IconSparkles,
  IconCheck,
  IconTarget,
  IconShieldCheck,
} from '../components/Icons';

const FEATURES = [
  'Deterministic NER-based resume parsing',
  'Multi-factor ATS alignment scoring',
  'Prioritized skill gap roadmaps',
  'Adaptive STAR interview simulation',
];

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await api.login(form.email, form.password);
      saveAuth(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function tryDemoAccount() {
    setLoading(true);
    setError('');
    const demoEmail = `engineer_${Math.floor(Math.random() * 90000 + 10000)}@careermatch.ai`;
    try {
      const { token, user } = await api.register('Alex Morgan', demoEmail, 'demo123456');
      saveAuth(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Demo access failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-layout">

      {/* Left Brand Panel */}
      <div className="auth-panel-left">
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Brand mark */}
          <div className="brand-tile" style={{ marginBottom: '3rem' }}>
            <img className="brand-logo-full brand-logo-auth" src={careerMatchLogo} alt="CareerMatch AI - Better Skills. Better Matches." />
          </div>

          {/* Headline */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', lineHeight: 1.2, marginBottom: '0.75rem' }}>
              Intelligence-driven career <span className="gradient-text">positioning</span>
            </h2>
            <p style={{ fontSize: '0.93rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>
              Stop guessing why you're not landing interviews. Get a deterministic analysis of exactly where you stand.
            </p>
          </div>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <IconCheck size={11} style={{ color: '#34d399' }} strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{f}</span>
              </div>
            ))}
          </div>

          {/* Stats grid */}
          <div className="auth-stat-grid">
            {[
              { value: '98.4%', label: 'Parsing precision' },
              { value: '4-Tier', label: 'Evaluation model' },
              { value: 'STAR', label: 'Interview rubric' },
              { value: '100%', label: 'Data private' },
            ].map((s) => (
              <div key={s.label} className="auth-stat-card">
                <div className="auth-stat-value">{s.value}</div>
                <div className="auth-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="auth-testimonial" style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '0.5rem' }}>
            Within 48 hours of using CareerMatch AI, I had a complete picture of exactly what I needed to land the Staff Engineer role I had been targeting for two years.
          </p>
          <div className="flex items-center gap-2" style={{ marginTop: '1rem' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: 700, color: '#fff',
            }}>P</div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>Priya S.</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Staff Engineer @ Stripe</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-panel-right">
        <div className="auth-form-container animate-fade-in-up">

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div className="hero-badge" style={{ marginBottom: '1rem' }}>
              <div className="hero-badge-dot" />
              <span>Secure session — zero data sharing</span>
            </div>
            <h1 style={{ fontSize: '1.7rem', marginBottom: '0.4rem' }}>Welcome back</h1>
            <p style={{ fontSize: '0.9rem' }}>
              Sign in to your candidate portal.{' '}
              <Link to="/register" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>
                Create account →
              </Link>
            </p>
          </div>

          {error && (
            <div className="alert alert-error animate-fade-in" style={{ marginBottom: '1.5rem' }}>
              <IconAlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* 1-Click Demo */}
          <button
            type="button"
            onClick={tryDemoAccount}
            disabled={loading}
            className="btn btn-secondary"
            style={{ width: '100%', marginBottom: '1.5rem', padding: '0.7rem 1rem', justifyContent: 'center' }}
          >
            {loading ? (
              <><span className="spinner" /><span>Setting up demo…</span></>
            ) : (
              <><IconSparkles size={15} style={{ color: 'var(--brand-primary)' }} /><span>Instant 1-Click Demo Access</span></>
            )}
          </button>

          <div className="beam-separator">or sign in with credentials</div>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                className="form-input"
                type="email"
                name="email"
                placeholder="alex.morgan@company.com"
                value={form.email}
                onChange={onChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                <span>Password</span>
              </label>
              <input
                id="login-password"
                className="form-input"
                type="password"
                name="password"
                placeholder="••••••••••••"
                value={form.password}
                onChange={onChange}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.25rem' }}
            >
              {loading ? (
                <><span className="spinner" /><span>Authenticating…</span></>
              ) : (
                <><span>Sign In</span><IconArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontSize: '0.82rem', color: 'var(--text-muted)',
          }}>
            <IconShieldCheck size={14} style={{ color: 'var(--matched)', flexShrink: 0 }} />
            <span>256-bit encrypted · No data sold · GDPR compliant</span>
          </div>

        </div>
      </div>
    </div>
  );
}
