import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated } from '../services/api';
import {
  IconCpu,
  IconTarget,
  IconFileText,
  IconCompass,
  IconMic,
  IconCheckCircle,
  IconArrowRight,
  IconShieldCheck,
  IconLayers,
  IconBarChart,
  IconSparkles,
  IconCheck,
  IconX,
  IconCode
} from '../components/Icons';

const DEMO_PROFILES = [
  {
    id: 'fullstack',
    role: 'Full-Stack Software Engineer',
    targetCompany: 'Stripe / TechScale Labs',
    matchScore: 86,
    candidateSkills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'REST APIs', 'Git', 'Jest'],
    requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Docker', 'System Design'],
    matchedSkills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
    gaps: ['Docker', 'System Design'],
    sampleQuestion: 'How would you structure database connection pooling in Express to prevent connection exhaustion under spike traffic?',
  },
  {
    id: 'data-ai',
    role: 'Staff Machine Learning Engineer',
    targetCompany: 'Scale AI / CoreData',
    matchScore: 78,
    candidateSkills: ['Python', 'SQL', 'Pandas', 'Scikit-learn', 'PyTorch', 'REST APIs'],
    requiredSkills: ['Python', 'SQL', 'PyTorch', 'Transformers', 'Kubernetes', 'MLOps'],
    matchedSkills: ['Python', 'SQL', 'PyTorch'],
    gaps: ['Transformers', 'Kubernetes', 'MLOps'],
    sampleQuestion: 'Walk me through how you detect and prevent subtle data leakage during cross-validation of sequential feature pipelines.',
  },
  {
    id: 'devops',
    role: 'Cloud Infrastructure / SRE',
    targetCompany: 'Datadog / CloudOps',
    matchScore: 91,
    candidateSkills: ['Linux', 'Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Prometheus'],
    requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
    matchedSkills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
    gaps: ['Helm Charts'],
    sampleQuestion: 'Describe your approach to executing zero-downtime rolling upgrades across stateful multi-region Kubernetes clusters.',
  },
];

export default function Landing() {
  const authed = isAuthenticated();
  const [activeProfile, setActiveProfile] = useState(DEMO_PROFILES[0]);

  return (
    <div className="page-wrapper landing-page" style={{ paddingTop: 0 }}>
      <div className="container">

        {/* Hero Section */}
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <div className="hero-badge animate-fade-in">
              <div className="hero-badge-dot" />
              <span>AI-powered job search</span>
            </div>

            <h1 className="animate-fade-in-up delay-1">
              Find the latest jobs that <span>match your resume.</span>
            </h1>

            <p className="animate-fade-in-up delay-2">
              Upload your resume once. CareerMatch AI scans thousands of roles, understands your real skills, and shows you where you are most likely to get shortlisted.
            </p>

            <div className="landing-hero-actions animate-fade-in-up delay-3">
              <Link to={authed ? '/dashboard' : '/register'} className="btn btn-primary btn-lg">
                <span>{authed ? 'Open my dashboard' : 'Upload resume free'}</span>
                <IconArrowRight size={17} />
              </Link>
              <a href="#sandbox" className="text-link">See how it works <IconArrowRight size={15} /></a>
            </div>

            <div className="landing-trust-row animate-fade-in-up delay-3">
              <div className="trust-avatars"><span>AK</span><span>RS</span><span>PM</span><span>+</span></div>
              <div><strong>80,000+ job seekers</strong><small>find better matches every month</small></div>
            </div>
          </div>

          <div className="match-preview animate-fade-in-up delay-2" aria-label="Example job match preview">
            <div className="match-preview-glow" />
            <div className="match-preview-window">
              <div className="preview-topline"><span className="preview-dots"><i /><i /><i /></span><span>your match report</span><span className="preview-live">LIVE</span></div>
              <div className="preview-profile"><div className="preview-avatar">AR</div><div><strong>Alex's job matches</strong><small>Based on your resume and skills</small></div><span className="preview-score">86%</span></div>
              <div className="preview-job"><div className="job-logo purple">S</div><div className="job-info"><strong>Senior Product Designer</strong><span>Stripe <b>Remote</b></span><div className="preview-tags"><em>Figma</em><em>Research</em><em>+3 skills</em></div></div><span className="job-match">Great match</span></div>
              <div className="preview-job"><div className="job-logo orange">A</div><div className="job-info"><strong>Product Designer II</strong><span>Atlassian <b>Hybrid</b></span><div className="preview-tags"><em>UX Strategy</em><em>Systems</em></div></div><span className="job-match">Good match</span></div>
              <div className="preview-footer"><IconCheckCircle size={16} /><span>Skills verified from your resume</span><IconArrowRight size={15} /></div>
            </div>
            <div className="preview-float-card"><IconSparkles size={17} /><span><strong>Personalized for you</strong><small>Not just keyword matching</small></span></div>
          </div>
        </section>

        <div className="landing-metrics">
          <span><strong>98.4%</strong> parsing precision</span><span><strong>8 lakh+</strong> roles indexed</span><span><strong>100%</strong> private and secure</span>
        </div>

        {/* Live Interactive Sandbox */}
        <section id="sandbox" style={{ padding: '2rem 0 4.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div className="badge badge-neutral" style={{ marginBottom: '0.5rem' }}>Interactive Demonstration</div>
            <h2>See How the Match Engine Analyzes Technical Profiles</h2>
            <p>Select a benchmark role to preview real-time skill extraction, score breakdown, and gap detection.</p>
          </div>

          {/* Role selector tabs */}
          <div className="flex justify-center gap-2" style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {DEMO_PROFILES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveProfile(p)}
                className={`btn ${activeProfile.id === p.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                {p.role}
              </button>
            ))}
          </div>

          {/* Interactive Match Card Preview */}
          <div className="pro-card" style={{ maxWidth: 960, margin: '0 auto' }}>
            <div className="pro-card-header">
              <div className="flex items-center gap-3">
                <div className="brand-icon-box" style={{ width: 36, height: 36 }}>
                  <IconTarget size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem' }}>{activeProfile.role}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Target Benchmark: {activeProfile.targetCompany}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge badge-success">
                  <span className="badge-dot" />
                  Score: {activeProfile.matchScore}%
                </span>
              </div>
            </div>

            <div className="pro-card-body">
              <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Matched Competencies */}
                <div>
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--matched)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Matched Competencies ({activeProfile.matchedSkills.length})
                    </span>
                    <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>Verified</span>
                  </div>
                  <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                    {activeProfile.matchedSkills.map((s) => (
                      <span key={s} className="skill-chip skill-chip-matched">
                        <IconCheck size={12} strokeWidth={2.5} />
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Detected Skill Gaps */}
                <div>
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gap)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Skill Gaps to Bridge ({activeProfile.gaps.length})
                    </span>
                    <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>Roadmap Action</span>
                  </div>
                  <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                    {activeProfile.gaps.map((s) => (
                      <span key={s} className="skill-chip skill-chip-gap">
                        <IconX size={12} strokeWidth={2.5} />
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sample Adaptive STAR Question Preview */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem 1.25rem',
              }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                  <div className="flex items-center gap-2">
                    <IconMic size={15} style={{ color: 'var(--brand-primary)' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Targeted STAR Interview Question
                    </span>
                  </div>
                  <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>Technical Deep-Dive</span>
                </div>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontStyle: 'italic', marginBottom: 0 }}>
                  "{activeProfile.sampleQuestion}"
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Pillars of Architecture */}
        <section style={{ padding: '3.5rem 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="badge badge-neutral" style={{ marginBottom: '0.5rem' }}>System Architecture</div>
            <h2>Built for Technical Depth and Complete Transparency</h2>
            <p>Traditional ATS keyword checkers fail on nuance. CareerMatch AI uses multi-layered semantic evaluation.</p>
          </div>

          <div className="grid-2" style={{ gap: '1.5rem' }}>
            {[
              {
                icon: IconFileText,
                title: 'Deterministic & Semantic Resume Parsing',
                desc: 'Extracts skills, work experience, certifications, and measurable impact metrics without stripping context or confusing synonyms.',
                badge: 'Input Stage',
              },
              {
                icon: IconTarget,
                title: 'Explainable Multi-Factor Scoring',
                desc: 'Clear mathematical weighting: 40% Required Skills, 30% Semantic Fit, 20% Experience Alignment, and 10% Preferred Qualifications.',
                badge: 'Evaluation Engine',
              },
              {
                icon: IconCompass,
                title: 'Prioritized Skill Remediation Roadmap',
                desc: 'Translates missing job requirements into structured engineering milestones with estimated hours and production capstone projects.',
                badge: 'Growth Path',
              },
              {
                icon: IconMic,
                title: 'Adaptive STAR Interview Simulation',
                desc: 'Generates targeted behavioral and technical questions based on your specific gaps and strengths, evaluated against strict rubrics.',
                badge: 'Interview Prep',
              },
            ].map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} className="pro-card" style={{ padding: '1.75rem' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                    <div className="kpi-icon-box" style={{ background: 'var(--brand-subtle)', color: 'var(--brand-primary)' }}>
                      <Icon size={18} />
                    </div>
                    <span className="badge badge-neutral">{f.badge}</span>
                  </div>
                  <h3 style={{ fontSize: '1.18rem', marginBottom: '0.5rem' }}>{f.title}</h3>
                  <p style={{ fontSize: '0.9rem' }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Comparison Matrix */}
        <section style={{ padding: '3rem 0 5rem' }}>
          <div className="pro-card" style={{ padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2>Traditional Keyword Checkers vs. CareerMatch AI</h2>
              <p>Why modern engineering hiring requires semantic understanding.</p>
            </div>

            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '30%' }}>Feature</th>
                    <th style={{ width: '35%' }}>Traditional ATS Scanners</th>
                    <th style={{ width: '35%', color: 'var(--brand-primary)' }}>CareerMatch AI</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      feature: 'Skill Extraction',
                      traditional: 'Naive exact string match (fails on React vs React.js)',
                      cm: 'Semantic NER with curated technical taxonomies',
                    },
                    {
                      feature: 'Score Transparency',
                      traditional: 'Black-box score with zero explanation',
                      cm: 'Factor breakdown with verified weights',
                    },
                    {
                      feature: 'Skill Gap Handling',
                      traditional: 'Simple list of missing words',
                      cm: 'Prioritized remediation roadmap with projects & hours',
                    },
                    {
                      feature: 'Interview Connection',
                      traditional: 'None — isolated document tool',
                      cm: 'Adaptive questions tailored to your exact profile gaps',
                    },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.feature}</td>
                      <td>{row.traditional}</td>
                      <td style={{ color: '#93c5fd', fontWeight: 500 }}>
                        <div className="flex items-center gap-2">
                          <IconCheck size={14} style={{ color: 'var(--matched)' }} />
                          <span>{row.cm}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          background: 'linear-gradient(180deg, var(--bg-surface) 0%, #0d1527 100%)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '3rem',
        }}>
          <h2 style={{ marginBottom: '0.75rem' }}>Ready to Elevate Your Engineering Profile?</h2>
          <p style={{ maxWidth: 560, margin: '0 auto 1.75rem' }}>
            Upload your current resume or choose from sample profiles to get an instant, explainable technical diagnostic.
          </p>
          <div className="flex justify-center gap-3">
            <Link to={authed ? "/dashboard" : "/register"} className="btn btn-primary btn-lg">
              <span>{authed ? "Go to Dashboard" : "Create Free Account"}</span>
              <IconArrowRight size={16} />
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
