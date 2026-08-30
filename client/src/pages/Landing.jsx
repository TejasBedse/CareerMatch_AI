import { Link } from 'react-router-dom';
import { isAuthenticated } from '../services/api';

const features = [
  { icon: '🎯', title: 'Explainable Match Score', desc: 'See exactly why you matched or missed — factor by factor, not just a number.' },
  { icon: '🧠', title: 'AI Skill Gap Analysis', desc: 'Identify critical vs low-priority gaps and get a ranked learning roadmap.' },
  { icon: '📄', title: 'Resume Intelligence', desc: 'Parse, analyze, and tailor your resume for each target role using ATS insights.' },
  { icon: '💬', title: 'Adaptive Interview Prep', desc: 'Practice interviews that adapt based on your weak areas and resume content.' },
  { icon: '🗺️', title: 'Skill Roadmap', desc: 'Transform missing skills into step-by-step action plans with progress tracking.' },
  { icon: '📊', title: 'Career Dashboard', desc: 'Track your readiness, applications, and skill development in one place.' },
];

const steps = [
  { num: '01', title: 'Upload Resume', desc: 'Paste or upload your resume. Our AI extracts skills, experience, and education.' },
  { num: '02', title: 'Paste Job Description', desc: 'Add any JD. The system separates required vs preferred qualifications.' },
  { num: '03', title: 'Get Your Match Report', desc: 'Receive an explainable score breakdown with strengths, gaps, and actions.' },
  { num: '04', title: 'Improve & Practice', desc: 'Follow your roadmap, practice interviews, and track progress over time.' },
];

export default function Landing() {
  const authed = isAuthenticated();

  return (
    <div style={{ overflowX: 'hidden' }}>

      {/* Hero */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '100px var(--space-6) var(--space-16)',
        textAlign: 'center',
      }}>
        {/* Decorative orbs */}
        <div className="orb orb-purple" style={{ width: 600, height: 600, top: -100, left: -200 }} />
        <div className="orb orb-pink" style={{ width: 400, height: 400, bottom: 0, right: -150 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760 }}>
          <div className="badge badge-purple animate-fade-in-up" style={{ marginBottom: 'var(--space-5)' }}>
            🚀 AI-Powered Career Intelligence Platform
          </div>

          <h1 className="animate-fade-in-up stagger-1" style={{ marginBottom: 'var(--space-5)' }}>
            Land Your Dream Job with{' '}
            <span className="gradient-text">Intelligent Career Matching</span>
          </h1>

          <p className="animate-fade-in-up stagger-2" style={{ fontSize: '1.2rem', maxWidth: 580, margin: '0 auto var(--space-8)' }}>
            Upload your resume, paste any job description, and get an explainable AI analysis
            with skill gaps, a personalized roadmap, and adaptive interview practice.
          </p>

          <div className="flex items-center justify-center gap-4 animate-fade-in-up stagger-3" style={{ flexWrap: 'wrap' }}>
            {authed ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard →</Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">Start for Free →</Link>
                <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
              </>
            )}
          </div>

          {/* Stats row */}
          <div className="grid-4 animate-fade-in-up stagger-4" style={{ maxWidth: 680, margin: '3rem auto 0', gap: 'var(--space-4)' }}>
            {[
              { value: '95%', label: 'Accuracy' },
              { value: '50+', label: 'Skills Detected' },
              { value: '4x', label: 'Faster Prep' },
              { value: '100%', label: 'Explainable' },
            ].map(s => (
              <div key={s.label} className="glass-card-static" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: 'var(--space-20) var(--space-6)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <div className="section-header">
            <span className="overline">How it works</span>
            <h2>From Resume to <span className="gradient-text">Job-Ready</span> in Minutes</h2>
            <p>A structured, AI-powered workflow that guides you from upload to offer-ready.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-6)' }}>
            {steps.map((step, i) => (
              <div key={step.num} className="glass-card" style={{ padding: 'var(--space-6)' }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  background: 'var(--grad-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 1,
                  marginBottom: 'var(--space-4)',
                  opacity: 0.8,
                }}>{step.num}</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-2)' }}>{step.title}</h3>
                <p style={{ fontSize: '0.9rem' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: 'var(--space-20) var(--space-6)' }}>
        <div className="container">
          <div className="section-header">
            <span className="overline">Features</span>
            <h2>Everything You Need to <span className="gradient-text">Compete & Win</span></h2>
            <p>Not just a score — a complete career intelligence system built for serious candidates.</p>
          </div>
          <div className="grid-3">
            {features.map((f, i) => (
              <div key={f.title} className="glass-card" style={{ padding: 'var(--space-6)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-4)' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.05rem', marginBottom: 'var(--space-2)' }}>{f.title}</h3>
                <p style={{ fontSize: '0.9rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: 'var(--space-20) var(--space-6)',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div className="orb orb-purple" style={{ width: 500, height: 500, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ marginBottom: 'var(--space-5)' }}>
            Ready to <span className="gradient-text">Match Smarter?</span>
          </h2>
          <p style={{ fontSize: '1.1rem', maxWidth: 480, margin: '0 auto var(--space-8)' }}>
            Join thousands of candidates who are using AI to close skill gaps and land interviews faster.
          </p>
          {!authed && (
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free →
            </Link>
          )}
          {authed && (
            <Link to="/resume" className="btn btn-primary btn-lg">
              Upload Resume →
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: 'var(--space-8) var(--space-6)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          © 2026 CareerMatch AI — CSE Data Science Academic Project
        </p>
      </footer>
    </div>
  );
}
