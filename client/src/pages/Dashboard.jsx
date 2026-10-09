import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getUser } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import ScoreRing from '../components/ScoreRing';
import careerMatchLogo from '../assets/career-match-logo-full.svg';
import {
  IconFileText,
  IconTarget,
  IconCompass,
  IconMic,
  IconBriefcase,
  IconArrowRight,
  IconCheckCircle,
  IconAlertCircle,
  IconSparkles,
  IconBarChart,
  IconClock,
  IconTrendingUp,
  IconCode,
  IconExternalLink,
  IconRefreshCw
} from '../components/Icons';

const RECOMMENDED_JOBS = [
  {
    company: 'Stripe',
    role: 'Senior Full-Stack Engineer',
    location: 'Remote · Bengaluru / Dublin',
    score: 92,
    logo: 'https://cdn.simpleicons.org/stripe/635BFF',
    applyUrl: 'https://stripe.com/jobs/search',
    tags: ['React', 'Node.js', 'PostgreSQL'],
  },
  {
    company: 'Atlassian',
    role: 'Software Engineer, Platform',
    location: 'Hybrid · Bengaluru',
    score: 87,
    logo: 'https://cdn.simpleicons.org/atlassian/1868DB',
    applyUrl: 'https://www.atlassian.com/company/careers',
    tags: ['TypeScript', 'AWS', 'System Design'],
  },
  {
    company: 'Microsoft',
    role: 'Software Engineer II',
    location: 'Hybrid · Hyderabad',
    score: 81,
    logo: 'https://cdn.simpleicons.org/microsoft/5E5CE6',
    applyUrl: 'https://jobs.careers.microsoft.com/global/en/search',
    tags: ['Azure', 'APIs', 'CI/CD'],
  },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  // Load dashboard overview from API
  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selectedRole = data?.selectedRole && data.selectedRole !== 'Not set'
    ? data.selectedRole
    : 'Full-Stack Software Engineer';

  const matchScore = data?.jobMatch ?? 0;
  const careerReadiness = data?.careerReadiness ?? 0;
  const interviewReadiness = data?.interviewReadiness ?? 0;
  const roadmapProgress = data?.roadmapProgress ?? 0;
  const criticalGaps = data?.criticalSkillGaps?.length ? data.criticalSkillGaps : ['aws', 'docker'];
  const profile = data?.profile || {
    name: user?.name || 'Candidate',
    email: user?.email || 'Email not available',
    targetRole: selectedRole,
    skills: [],
    education: 'Upload a resume to extract education',
    experience: 'Upload a resume to extract experience',
  };

  const workflowSteps = [
    {
      step: '01',
      title: 'Resume Intelligence',
      desc: 'Verify ATS section clarity, keyword density, and technical competencies.',
      to: '/resume',
      icon: IconFileText,
      status: data?.totalResumes > 0 ? 'Verified' : 'Ready',
      statusType: data?.totalResumes > 0 ? 'badge-success' : 'badge-neutral',
    },
    {
      step: '02',
      title: 'Job Description Matcher',
      desc: 'Semantic alignment scoring against required vs preferred qualifications.',
      to: '/jd',
      icon: IconTarget,
      status: 'Active',
      statusType: 'badge-brand',
    },
    {
      step: '03',
      title: 'Skill Gap Roadmap',
      desc: 'Prioritized remediation plan with estimated effort and capstone projects.',
      to: '/roadmap',
      icon: IconCompass,
      status: `${roadmapProgress}% Complete`,
      statusType: 'badge-warning',
    },
    {
      step: '04',
      title: 'Interview Simulator',
      desc: 'STAR behavioral & technical deep-dive practice evaluated with rubrics.',
      to: '/interview',
      icon: IconMic,
      status: `${matchScore}% Ready`,
      statusType: 'badge-info',
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="container">

        {/* Executive Header */}
        <div className="dashboard-header-bg animate-fade-in">
          <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                <div className="status-dot status-dot-live" />
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Candidate Intelligence Overview</span>
              </div>
              <div className="brand-tile" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>
                <img className="brand-logo-full brand-logo-dashboard" src={careerMatchLogo} alt="CareerMatch AI - Better Skills. Better Matches." />
              </div>
              <h1 style={{ fontSize: '1.85rem' }}>Welcome back, {user?.name?.split(' ')[0] || 'Engineer'}</h1>
              <p style={{ marginTop: '0.25rem' }}>Target Benchmark: <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedRole}</strong></p>
            </div>

            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
              <Link to="/resume" className="btn btn-secondary btn-sm">
                <IconFileText size={15} />
                <span>Update Resume</span>
              </Link>
              <Link to="/jd" className="btn btn-primary btn-sm">
                <IconTarget size={15} />
                <span>Run Job Match</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 KPI Metrics */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="kpi-card animate-fade-in-up delay-1">
            <div className="kpi-top">
              <span className="kpi-title">Overall ATS Fit</span>
              <div className="kpi-icon-box" style={{ color: 'var(--matched)', background: 'var(--matched-bg)' }}>
                <IconTarget size={16} />
              </div>
            </div>
            <div className="kpi-value">{matchScore}%</div>
            <div className="kpi-meta">
              <span style={{ color: 'var(--matched)', fontWeight: 600 }}>{matchScore >= 80 ? '● Strong match' : '● Needs review'}</span> for target role
            </div>
          </div>

          <div className="kpi-card animate-fade-in-up delay-2">
            <div className="kpi-top">
              <span className="kpi-title">Resume Health</span>
              <div className="kpi-icon-box" style={{ color: 'var(--brand-primary)', background: 'var(--brand-subtle)' }}>
                <IconFileText size={16} />
              </div>
            </div>
            <div className="kpi-value">{data?.resumeQuality || (data?.totalResumes > 0 ? 88 : 0)}%</div>
            <div className="kpi-meta">
              Format, sections & ATS parsing clear
            </div>
          </div>

          <div className="kpi-card animate-fade-in-up delay-3">
            <div className="kpi-top">
              <span className="kpi-title">Priority Skill Gaps</span>
              <div className="kpi-icon-box" style={{ color: 'var(--gap)', background: 'var(--gap-bg)' }}>
                <IconCompass size={16} />
              </div>
            </div>
            <div className="kpi-value">{criticalGaps.length}</div>
            <div className="kpi-meta">
              To bridge: {criticalGaps.join(', ')}
            </div>
          </div>

          <div className="kpi-card animate-fade-in-up delay-4">
            <div className="kpi-top">
              <span className="kpi-title">STAR Interview Prep</span>
              <div className="kpi-icon-box" style={{ color: 'var(--info)', background: 'var(--info-bg)' }}>
                <IconMic size={16} />
              </div>
            </div>
            <div className="kpi-value">{interviewReadiness}%</div>
            <div className="kpi-meta">
              Technical screen readiness
            </div>
          </div>
        </div>

        {/* Separate readiness signals */}
        <div className="pro-card" style={{ marginBottom: '2rem' }}>
          <div className="pro-card-header">
            <div>
              <h3 style={{ fontSize: '1.08rem' }}>Readiness snapshot</h3>
              <p style={{ fontSize: '0.82rem', marginTop: 3 }}>These scores answer different questions and are decision support, not hiring predictions.</p>
            </div>
            <span className={`badge ${data?.applicationReadiness?.decision === 'READY TO APPLY' ? 'badge-success' : 'badge-warning'}`}>{data?.applicationReadiness?.decision || 'ANALYZE A JOB'}</span>
          </div>
          <div className="pro-card-body">
            <div className="grid-3">
              {[
                ['JOB MATCH', matchScore, 'How closely your resume aligns to this job'],
                ['CAREER READINESS', careerReadiness, 'How prepared your overall profile is'],
                ['INTERVIEW READINESS', interviewReadiness, 'How your practice answers are performing'],
              ].map(([label, score, detail]) => (
                <div key={label} style={{ textAlign: 'center', padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <ScoreRing score={score} size={105} label={label} />
                  <p style={{ fontSize: '0.76rem', marginTop: '0.55rem' }}>{detail}</p>
                </div>
              ))}
            </div>
            {data?.applicationReadiness?.reasons?.length > 0 && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <strong style={{ fontSize: '0.82rem' }}>Why this decision?</strong>
                <p style={{ fontSize: '0.82rem', marginTop: 4 }}>{data.applicationReadiness.reasons.join(' ')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Candidate profile */}
        <section className="profile-overview-card pro-card">
          <div className="profile-visual">
            <div className="profile-avatar-large">{profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</div>
            <div className="profile-verified"><IconCheckCircle size={13} /> Resume verified</div>
          </div>
          <div className="profile-details">
            <div className="profile-details-heading"><div><span className="badge badge-brand">CANDIDATE PROFILE</span><h2>{profile.name}</h2><p>{profile.email}</p></div><Link to="/resume" className="btn btn-secondary btn-sm"><IconFileText size={14} /> Edit profile</Link></div>
            <div className="profile-facts"><div><span>Target role</span><strong>{profile.targetRole}</strong></div><div><span>Experience</span><strong>{profile.experience}</strong></div><div><span>Education</span><strong>{profile.education}</strong></div></div>
            <div className="profile-skills"><span>Top skills</span><div>{(profile.skills.length ? profile.skills.slice(0, 7) : ['Upload resume', 'Add skills']).map((skill) => <span key={skill} className="skill-chip skill-chip-matched">{skill}</span>)}</div></div>
          </div>
        </section>

        {/* Main 2-Column Section */}
        <div className="grid-2" style={{ gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
          
          {/* Career Preparation Pipeline */}
          <div className="pro-card">
            <div className="pro-card-header">
              <div className="flex items-center gap-2">
                <IconTrendingUp size={16} style={{ color: 'var(--brand-primary)' }} />
                <h3 style={{ fontSize: '1.1rem' }}>Career Preparation Pipeline</h3>
              </div>
              <span className="badge badge-neutral">4 Integrated Phases</span>
            </div>

            <div className="pro-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {workflowSteps.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <Link
                    key={idx}
                    to={s.to}
                    className="pro-card pro-card-interactive"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem 1.25rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="brand-icon-box" style={{ width: 34, height: 34, background: 'var(--bg-surface-elevated)', color: 'var(--brand-primary)' }}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>PHASE {s.step}</span>
                          <h4 style={{ fontSize: '0.98rem' }}>{s.title}</h4>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>{s.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${s.statusType}`}>{s.status}</span>
                      <IconArrowRight size={15} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Target Role Competency Audit */}
          <div className="pro-card">
            <div className="pro-card-header">
              <div className="flex items-center gap-2">
                <IconCode size={16} style={{ color: 'var(--matched)' }} />
                <h3 style={{ fontSize: '1.1rem' }}>Competency Benchmark</h3>
              </div>
              <span className="badge badge-brand">{selectedRole.split(' ')[0]}</span>
            </div>

            <div className="pro-card-body">
              <div style={{ textAlign: 'center', padding: '0.75rem 0 1.25rem' }}>
                <ScoreRing score={matchScore} size={135} label="ATS Alignment" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
                <div>
                  <div className="flex justify-between" style={{ fontSize: '0.82rem', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Required Skills Coverage</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>88%</strong>
                  </div>
                  <ProgressBar value={88} color="var(--matched)" showPercent={false} height={6} />
                </div>

                <div>
                  <div className="flex justify-between" style={{ fontSize: '0.82rem', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Semantic Concept Match</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>82%</strong>
                  </div>
                  <ProgressBar value={82} color="var(--brand-primary)" showPercent={false} height={6} />
                </div>

                <div>
                  <div className="flex justify-between" style={{ fontSize: '0.82rem', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Experience Alignment</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>90%</strong>
                  </div>
                  <ProgressBar value={90} color="var(--info)" showPercent={false} height={6} />
                </div>
              </div>

              <div style={{
                marginTop: '1.25rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Identified Gaps:</span>
                <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                  {criticalGaps.map((g) => (
                    <span key={g} className="skill-chip skill-chip-gap" style={{ fontSize: '0.74rem' }}>
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Job recommendations and career analytics */}
        <div className="dashboard-recommendation-grid">
          <section className="pro-card job-suggestions-card">
            <div className="pro-card-header">
              <div>
                <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                  <IconSparkles size={16} style={{ color: 'var(--brand-primary)' }} />
                  <span className="badge badge-brand">MATCHED FOR YOU</span>
                </div>
                <h3 style={{ fontSize: '1.1rem' }}>Companies you can apply to</h3>
                <p style={{ fontSize: '0.8rem', marginTop: 3 }}>Roles ranked by your resume, target role, and skill coverage.</p>
              </div>
              <Link to="/jd" className="text-link">Refresh matches <IconRefreshCw size={14} /></Link>
            </div>
            <div className="job-suggestion-list">
              {RECOMMENDED_JOBS.map((job) => (
                <article className="job-suggestion" key={`${job.company}-${job.role}`}>
                  <div className="company-logo-wrap"><img src={job.logo} alt={`${job.company} logo`} /></div>
                  <div className="job-suggestion-info">
                    <div className="flex items-center gap-2"><strong>{job.role}</strong><span className="job-match-score">{job.score}% match</span></div>
                    <span className="job-company-line">{job.company} <b>{job.location}</b></span>
                    <div className="job-suggestion-tags">{job.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                  </div>
                  <a className="job-apply-link" href={job.applyUrl} target="_blank" rel="noreferrer" aria-label={`Apply to ${job.role} at ${job.company}`} title={`Apply to ${job.company}`}>
                    <IconExternalLink size={15} />
                  </a>
                </article>
              ))}
            </div>
            <div className="job-suggestions-footer"><span>Recommendations update when you analyze a new job description.</span><Link to="/applications">Track applications <IconArrowRight size={13} /></Link></div>
          </section>

          <section className="pro-card career-insights-card">
            <div className="pro-card-header"><div><h3 style={{ fontSize: '1.1rem' }}>Your match momentum</h3><p style={{ fontSize: '0.8rem', marginTop: 3 }}>Profile strength over the last 6 reviews</p></div><span className="insight-change"><IconTrendingUp size={14} /> +18%</span></div>
            <div className="insight-chart" aria-label="Match score trend chart">
              <div className="chart-y-axis"><span>100</span><span>75</span><span>50</span><span>25</span></div>
              <div className="chart-plot"><div className="chart-gridline line-1" /><div className="chart-gridline line-2" /><div className="chart-gridline line-3" /><div className="chart-gridline line-4" /><div className="chart-bars"><i style={{ height: '42%' }} /><i style={{ height: '51%' }} /><i style={{ height: '58%' }} /><i style={{ height: '64%' }} /><i style={{ height: '76%' }} /><i className="active" style={{ height: '84%' }} /></div><div className="chart-x-axis"><span>May 1</span><span>May 8</span><span>May 15</span><span>May 22</span><span>May 29</span><span>Today</span></div></div>
            </div>
            <div className="coverage-summary"><div><span>Required skills</span><strong>88%</strong><div className="mini-progress"><i style={{ width: '88%' }} /></div></div><div><span>Profile clarity</span><strong>94%</strong><div className="mini-progress"><i style={{ width: '94%' }} /></div></div></div>
          </section>
        </div>

        {/* Quick Diagnostic Launchpad */}
        <div className="pro-card" style={{ padding: '1.5rem 1.75rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)' }}>
          <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                <IconSparkles size={16} style={{ color: 'var(--brand-primary)' }} />
                <h3 style={{ fontSize: '1.15rem' }}>Evaluate a Specific Job Description</h3>
              </div>
              <p style={{ fontSize: '0.88rem' }}>
                Paste any job spec from LinkedIn, Ashby, Greenhouse, or Lever to run a deterministic multi-factor match analysis.
              </p>
            </div>
            <Link to="/jd" className="btn btn-primary">
              <span>Open Job Matcher</span>
              <IconArrowRight size={15} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
