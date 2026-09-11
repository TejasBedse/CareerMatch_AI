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
  IconBarChart,
  IconCompass,
} from '../components/Icons';

const BENEFITS = [
  { icon: IconTarget, label: 'Explainable match scoring', desc: '4-factor weighted ATS analysis' },
  { icon: IconCompass, label: 'Gap remediation roadmap', desc: 'Prioritized with hours + projects' },
  { icon: IconBarChart, label: 'Interview simulation', desc: 'STAR rubric-evaluated practice' },
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await api.register(form.name, form.email, form.password);
      saveAuth(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
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
              Know exactly <span className="gradient-text">why</span> you get callbacks — or don't
            </h2>
            <p style={{ fontSize: '0.93rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>
              CareerMatch AI gives you the same signal-to-noise analysis that top engineering hiring managers run — in seconds.
            </p>
          </div>

          {/* Benefit cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2.5rem' }}>
            {BENEFITS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3" style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 'var(--radius-sm)',
                  background: 'var(--brand-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={16} style={{ color: 'var(--brand-primary)' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{label}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats grid */}
          <div className="auth-stat-grid">
            {[
              { value: 'Free', label: 'Always free to start' },
              { value: '<60s', label: 'Time to first insight' },
              { value: '100%', label: 'Privacy guaranteed' },
              { value: '4-tier', label: 'Evaluation depth' },
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
            I went from 2% callback rate to 40% within a month. CareerMatch AI showed me the three specific skills I was missing for ML Engineer roles.
          </p>
          <div className="flex items-center gap-2" style={{ marginTop: '1rem' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: 700, color: '#fff',
            }}>R</div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>Raj K.</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>ML Engineer @ Scale AI</div>
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
              <span>Free account — no credit card required</span>
            </div>
            <h1 style={{ fontSize: '1.7rem', marginBottom: '0.4rem' }}>Create your profile</h1>
            <p style={{ fontSize: '0.9rem' }}>
              Get your first technical diagnostic in under 60 seconds.{' '}
              <Link to="/login" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>
                Sign in →
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
              <><span className="spinner" /><span>Creating demo account…</span></>
            ) : (
              <><IconSparkles size={15} style={{ color: 'var(--brand-primary)' }} /><span>Instant Demo (Alex Morgan)</span></>
            )}
          </button>

          <div className="beam-separator">or create an account</div>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full name</label>
              <input
                id="reg-name"
                className="form-input"
                type="text"
                name="name"
                placeholder="Alex Morgan"
                value={form.name}
                onChange={onChange}
                required
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email address</label>
              <input
                id="reg-email"
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
              <label className="form-label" htmlFor="reg-password">
                <span>Password</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 400 }}>min. 6 characters</span>
              </label>
              <input
                id="reg-password"
                className="form-input"
                type="password"
                name="password"
                placeholder="••••••••••••"
                value={form.password}
                onChange={onChange}
                required
                autoComplete="new-password"
              />
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.25rem' }}
            >
              {loading ? (
                <><span className="spinner" /><span>Creating profile…</span></>
              ) : (
                <><span>Create Candidate Profile</span><IconArrowRight size={16} /></>
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
