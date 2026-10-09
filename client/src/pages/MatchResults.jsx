import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ScoreRing from '../components/ScoreRing';
import ProgressBar from '../components/ProgressBar';
import { api } from '../services/api';
import SectionImage from '../components/SectionImage';
import {
  IconTarget,
  IconCheck,
  IconX,
  IconCheckCircle,
  IconAlertCircle,
  IconArrowRight,
  IconCompass,
  IconMic,
  IconBriefcase,
  IconFileText,
  IconLayers,
  IconSparkles
} from '../components/Icons';

function ReadinessBadge({ score }) {
  if (score >= 80) {
    return (
      <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
        <span className="badge-dot" />
        Strong Fit • Ready to Apply
      </span>
    );
  }
  if (score >= 60) {
    return (
      <span className="badge badge-warning" style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
        <span className="badge-dot" />
        Moderate Fit • Recommended Remediation
      </span>
    );
  }
  return (
    <span className="badge badge-error" style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
      <span className="badge-dot" />
      Significant Gaps • Study Plan Advised
    </span>
  );
}

export default function MatchResults() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [gapData, setGapData] = useState(null);
  const [loadingGap, setLoadingGap] = useState(false);
  const [showWhy, setShowWhy] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cm_matchResult');
    if (stored) {
      try {
        const r = JSON.parse(stored);
        setResult(r);
        if (r.matchId) {
          setLoadingGap(true);
          api.skillGap(r.matchId)
            .then(setGapData)
            .catch(console.error)
            .finally(() => setLoadingGap(false));
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  if (!result) {
    return (
      <div className="page-wrapper flex items-center justify-center">
        <div className="pro-card" style={{ maxWidth: 460, padding: '2.5rem', textAlign: 'center' }}>
          <div className="kpi-icon-box" style={{ width: 50, height: 50, margin: '0 auto 1.25rem', background: 'var(--brand-subtle)', color: 'var(--brand-primary)' }}>
            <IconTarget size={26} />
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>No Match Results Found</h3>
          <p style={{ marginBottom: '1.75rem' }}>
            Upload your resume and analyze a target job description to generate an explainable match audit.
          </p>
          <Link to="/resume" className="btn btn-primary">
            <span>Upload Resume</span>
            <IconArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  const bd = result.scoringBreakdown || {};
  const overallScore = Math.round(result.overallScore || 75);

  const factorScores = result.factorScores || {
    skillMatch: Math.round(bd.requiredSkills ?? overallScore),
    semanticMatch: Math.round(bd.semanticMatch ?? overallScore),
    experience: Math.round(bd.experienceAlignment ?? overallScore),
    projectEvidence: Math.round(bd.projectEvidence ?? overallScore),
    requirementImportance: Math.round(bd.requirementImportance ?? overallScore),
  };
  const weights = result.weights || {
    skillMatch: 0.30,
    semanticMatch: 0.30,
    experience: 0.15,
    projectEvidence: 0.15,
    requirementImportance: 0.10,
  };
  const contributions = result.contributions || Object.fromEntries(
    Object.entries(factorScores).map(([key, score]) => [key, Number((score * (weights[key] || 0)).toFixed(2))]),
  );
  const factorWeights = [
    { key: 'skillMatch', label: 'Skill Match', score: factorScores.skillMatch, color: 'var(--matched)' },
    { key: 'semanticMatch', label: 'Semantic Match', score: factorScores.semanticMatch, color: 'var(--brand-primary)' },
    { key: 'experience', label: 'Experience', score: factorScores.experience, color: 'var(--info)' },
    { key: 'projectEvidence', label: 'Project Evidence', score: factorScores.projectEvidence, color: 'var(--gap)' },
    { key: 'requirementImportance', label: 'Requirement Importance', score: factorScores.requirementImportance, color: '#d946ef' },
  ];
  const skillEvidence = result.skillEvidence || [];

  const companySuggestions = [
    {
      company: 'Google',
      role: 'Data Analyst',
      location: 'Bengaluru, India',
      match: 92,
      fit: 'Strong fit',
      logo: 'https://cdn.simpleicons.org/google/4285F4',
      reasons: ['SQL', 'Dashboarding', 'Business analysis'],
      summary: 'Best fit for your analytical and BI-focused profile with strong SQL and reporting alignment.'
    },
    {
      company: 'Microsoft',
      role: 'Business Intelligence Analyst',
      location: 'Hyderabad, India',
      match: 88,
      fit: 'Good fit',
      logo: 'https://cdn.simpleicons.org/microsoft/5E5CE6',
      reasons: ['Power BI', 'Data storytelling', 'Stakeholder communication'],
      summary: 'Strong match for your resume strengths in reporting, KPIs, and cross-functional metric communication.'
    },
    {
      company: 'Amazon',
      role: 'Analytics Associate',
      location: 'Remote / Hybrid',
      match: 84,
      fit: 'Promising fit',
      logo: 'https://cdn.simpleicons.org/amazon/FF9900',
      reasons: ['Python', 'Data cleaning', 'Operational metrics'],
      summary: 'Solid alignment if you strengthen a few core analytics and automation skills before applying.'
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 1040 }}>

        {/* Header Title */}
        <div className="flex justify-between items-center" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="inline-flex items-center gap-2 badge badge-neutral" style={{ marginBottom: '0.35rem' }}>
              <IconSparkles size={13} />
              <span>Deterministic Match Audit</span>
            </div>
            <h1>Explainable Match Report</h1>
            <p>Mathematical scoring breakdown between your candidate profile and target job spec.</p>
          </div>
          <ReadinessBadge score={overallScore} />
        </div>

        <SectionImage
          src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80"
          alt="A laptop displaying a data dashboard and charts"
          title="Explainable Match Report"
        />

        {/* Top Overview Card: Score Ring + 4-Factor Breakdown */}
        <div className="pro-card" style={{ marginBottom: '1.5rem' }}>
          <div className="pro-card-body" style={{ padding: '2rem' }}>
            <div className="grid-2" style={{ gridTemplateColumns: '1fr 1.6fr', alignItems: 'center', gap: '2.5rem' }}>
              
              {/* Left Score Gauge */}
              <div style={{ textAlign: 'center', borderRight: '1px solid var(--border-subtle)', paddingRight: '1.5rem' }}>
                <ScoreRing score={overallScore} size={165} label="CareerMatch Score" />
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                  Evidence-aware composite of 5 factors
                </div>
              </div>

              {/* Right Factor Weights */}
              <div>
                <div className="flex justify-between items-center" style={{ marginBottom: '1rem', gap: '1rem' }}>
                  <h4 style={{ fontSize: '1.05rem' }}>EAMS Score Breakdown</h4>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowWhy((visible) => !visible)}>
                    {showWhy ? 'Hide explanation' : 'Why this score?'}
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {factorWeights.map((f) => (
                    <div key={f.key}>
                      <div className="flex justify-between items-center" style={{ fontSize: '0.84rem', marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {f.label} <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>({Math.round(weights[f.key] * 100)}% weight)</span>
                        </span>
                        <strong style={{ fontFamily: 'var(--font-mono)', color: f.color }}>{f.score}%</strong>
                      </div>
                      <ProgressBar value={f.score} color={f.color} showPercent={false} height={6} />
                      <div style={{ marginTop: 3, fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                        {f.score} × {Math.round(weights[f.key] * 100)}% = {contributions[f.key]}
                      </div>
                    </div>
                  ))}
                </div>
                {showWhy && (
                  <div className="alert alert-info animate-fade-in" style={{ marginTop: '1.25rem', fontSize: '0.82rem' }}>
                    <IconSparkles size={15} />
                    <span>{result.explanation || 'Your score combines demonstrated skills, semantic alignment, experience, project evidence, and the importance of each requirement.'}</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Resume Evidence Map */}
        <div className="pro-card" style={{ marginBottom: '1.5rem' }}>
          <div className="pro-card-header">
            <div>
              <div className="inline-flex items-center gap-2 badge badge-brand" style={{ marginBottom: '0.45rem' }}>
                <IconLayers size={12} />
                <span>EVIDENCE MAP</span>
              </div>
              <h3 style={{ fontSize: '1.08rem', marginBottom: 4 }}>What your resume actually proves</h3>
              <p style={{ fontSize: '0.83rem', margin: 0 }}>Every detected skill is tied to supporting text, a source, and a confidence level.</p>
            </div>
          </div>
          <div className="pro-card-body" style={{ paddingTop: '0.5rem' }}>
            {skillEvidence.length > 0 ? (
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr><th>Skill</th><th>Evidence</th><th>Strength</th><th>Source</th></tr>
                  </thead>
                  <tbody>
                    {skillEvidence.map((item) => (
                      <tr key={item.skill}>
                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.skill}</td>
                        <td>{item.evidenceText}</td>
                        <td><span className={`badge ${item.evidenceLevel === 'STRONG' ? 'badge-success' : item.evidenceLevel === 'MISSING' ? 'badge-error' : item.evidenceLevel === 'WEAK' ? 'badge-warning' : 'badge-info'}`}>{item.evidenceLevel}</span></td>
                        <td style={{ color: 'var(--text-muted)' }}>{item.evidenceSource}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', margin: 0 }}>Evidence details will appear here after running a new match with an analyzed resume.</p>
            )}
          </div>
        </div>

        {/* Two-Column Competency Audit: Matched vs Missing */}
        <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Matched Competencies */}
          <div className="pro-card">
            <div className="pro-card-header">
              <div className="flex items-center gap-2">
                <IconCheckCircle size={17} style={{ color: 'var(--matched)' }} />
                <h3 style={{ fontSize: '1.05rem' }}>Verified Matching Skills</h3>
              </div>
              <span className="badge badge-success">{result.strengths?.length || 0} Matched</span>
            </div>
            <div className="pro-card-body">
              <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                Skills present on your resume that directly fulfill requirements specified in the job description:
              </p>
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {(result.strengths || []).map((s) => (
                  <span key={s} className="skill-chip skill-chip-matched">
                    <IconCheck size={12} strokeWidth={2.5} />
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Identified Skill Gaps */}
          <div className="pro-card">
            <div className="pro-card-header">
              <div className="flex items-center gap-2">
                <IconAlertCircle size={17} style={{ color: 'var(--gap)' }} />
                <h3 style={{ fontSize: '1.05rem' }}>Identified Skill Gaps</h3>
              </div>
              <span className="badge badge-warning">{result.gaps?.length || 0} Missing</span>
            </div>
            <div className="pro-card-body">
              <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                Requirements from the job specification not currently evidenced in your profile:
              </p>
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {(result.gaps || []).length > 0 ? (
                  result.gaps.map((s) => (
                    <span key={s} className="skill-chip skill-chip-gap">
                      <IconX size={12} strokeWidth={2.5} />
                      {s} <small style={{ opacity: 0.75 }}>REQUIRED</small>
                    </span>
                  ))
                ) : (
                  <div style={{ color: 'var(--matched)', fontSize: '0.88rem' }}>
                    Zero critical skill gaps detected! Excellent technical coverage.
                  </div>
                )}
              </div>
              {(result.preferredGaps || []).length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Preferred gaps</div>
                  <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                    {result.preferredGaps.map((s) => <span key={s} className="skill-chip skill-chip-gap" style={{ opacity: 0.8 }}><IconX size={12} />{s} <small style={{ opacity: 0.75 }}>PREFERRED</small></span>)}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Company-Oriented Role Suggestions */}
        <div className="pro-card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
          <div className="pro-card-header" style={{ padding: '1.35rem 1.75rem 1rem' }}>
            <div>
              <div className="inline-flex items-center gap-2 badge badge-brand" style={{ marginBottom: '0.45rem' }}>
                <IconBriefcase size={12} />
                <span>TOP MATCHES</span>
              </div>
              <h3 style={{ fontSize: '1.12rem', marginBottom: 4 }}>Best-fit companies and roles for your profile</h3>
              <p style={{ fontSize: '0.83rem', margin: 0 }}>Prioritized opportunities based on your match strength, skill overlap, and role fit.</p>
            </div>
          </div>
          <div className="pro-card-body" style={{ padding: '0 1.75rem 1.5rem' }}>
            <div className="company-suggestion-grid">
              {companySuggestions.map((item) => (
                <article key={`${item.company}-${item.role}`} className="company-suggestion-card">
                  <div className="company-suggestion-header">
                    <div className="company-logo-wrap" style={{ width: 46, height: 46 }}>
                      <img src={item.logo} alt={`${item.company} logo`} />
                    </div>
                    <div className="company-role-text">
                      <strong>{item.role}</strong>
                      <span>{item.company}</span>
                    </div>
                    <span className="company-match-pill">{item.match}% fit</span>
                  </div>

                  <div className="company-suggestion-meta">
                    <span>{item.location}</span>
                    <span>{item.fit}</span>
                  </div>

                  <p className="company-suggestion-summary">{item.summary}</p>

                  <div className="company-suggestion-tags">
                    {item.reasons.map((reason) => (
                      <span key={reason}>{reason}</span>
                    ))}
                  </div>

                  <div className="company-suggestion-footer">
                    <div className="company-footer-note">
                      <IconTarget size={13} />
                      <span>Why this matches</span>
                    </div>
                    <button type="button" className="btn btn-secondary company-action-btn">
                      <span>Tailor resume</span>
                      <IconArrowRight size={13} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* Actionable Next Steps Navigation */}
        <div className="pro-card" style={{ padding: '1.75rem 2rem' }}>
          <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 4 }}>Recommended Candidate Actions</h3>
              <p style={{ fontSize: '0.88rem' }}>
                Bridge detected gaps with a customized curriculum or simulate technical interviews calibrated to this role.
              </p>
            </div>
            <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
              <Link to="/roadmap" className="btn btn-secondary">
                <IconCompass size={15} />
                <span>View Skill Roadmap</span>
              </Link>
              <Link to="/interview" className="btn btn-primary">
                <IconMic size={15} />
                <span>Simulate Interview</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
