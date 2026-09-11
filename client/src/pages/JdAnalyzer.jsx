import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  IconTarget,
  IconBriefcase,
  IconBuilding,
  IconCheck,
  IconCheckCircle,
  IconAlertCircle,
  IconArrowRight,
  IconArrowLeft,
  IconSparkles,
  IconLayers,
  IconFileText
} from '../components/Icons';

const SAMPLE_JDS = [
  {
    title: 'Senior Full-Stack Software Engineer',
    company: 'Stripe / Core Platform',
    text: `Role: Senior Full-Stack Software Engineer
Company: Stripe Platform
Location: Remote / Hybrid

About the Role:
We are seeking a Senior Full-Stack Engineer to architect resilient web services, developer APIs, and high-volume billing workflows.

Key Required Qualifications:
• 3+ years of experience with React, TypeScript, and modern front-end state architectures.
• Strong hands-on proficiency designing RESTful APIs and microservices in Node.js and Express.
• Deep experience with PostgreSQL, schema indexing, and database query optimization.
• Hands-on proficiency with Docker, Git version control, and automated CI/CD pipelines.
• Solid grasp of system design, distributed caching with Redis, and web application security.

Preferred Qualifications:
• Experience with cloud infrastructure on AWS or GCP.
• Familiarity with end-to-end integration testing using Jest or Playwright.
• Background in financial systems, high concurrency, or payment gateways.`,
  },
  {
    id: 'ml',
    title: 'Staff Machine Learning Engineer',
    company: 'Scale AI',
    text: `Role: Staff Machine Learning Engineer
Company: Scale AI
Location: San Francisco, CA

About the Role:
Join our foundation model infrastructure team building production inference pipelines, continuous data evaluations, and fine-tuning architectures.

Required Qualifications:
• 3+ years experience developing production ML systems in Python.
• Deep proficiency with PyTorch, Scikit-learn, SQL, and Pandas.
• Experience training, evaluating, and deploying deep neural network architectures.
• Strong understanding of distributed training, GPU optimization, and Kubernetes.

Preferred Qualifications:
• Experience with LLM fine-tuning, Transformers, and vector database embeddings.
• Published research in top-tier conferences (NeurIPS, ICML, CVPR).`,
  },
];

export default function JdAnalyzer() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('input'); // 'input' | 'result'
  const [jdResult, setJdResult] = useState(null);
  const [matching, setMatching] = useState(false);
  const [matchError, setMatchError] = useState('');
  const [savedJobs, setSavedJobs] = useState([]);
  const [selectedJobIds, setSelectedJobIds] = useState([]);
  const [comparisons, setComparisons] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  const resumeId = localStorage.getItem('cm_resumeId');

  function loadSample(sample) {
    setTitle(sample.title);
    setCompany(sample.company);
    setText(sample.text);
    setError('');
  }

  async function handleAnalyze(e) {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please paste a job description.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.analyzeJd(title, company, text);
      setJdResult(res);
      localStorage.setItem('cm_jdProfile', JSON.stringify(res));
      setStep('result');
      if (res.jdId) localStorage.setItem('cm_jdId', res.jdId);
      api.getJobs().then((data) => setSavedJobs(data.jobs || [])).catch(() => setSavedJobs([]));
    } catch (err) {
      setError(err.message || 'Failed to analyze job description.');
    } finally {
      setLoading(false);
    }
  }

  function toggleJob(jobId) {
    setSelectedJobIds((current) => current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId]);
  }

  async function handleCompareJobs() {
    const currentId = jdResult?.jdId || localStorage.getItem('cm_jdId');
    const ids = Array.from(new Set([currentId, ...selectedJobIds].filter(Boolean)));
    if (ids.length < 2 || !resumeId) return;
    setComparisonLoading(true);
    try {
      const data = await api.compareMatches(resumeId, ids);
      setComparisons(data.comparisons || []);
    } catch (err) {
      setMatchError(err.message || 'Unable to compare jobs.');
    } finally {
      setComparisonLoading(false);
    }
  }

  async function handleRunMatch() {
    const jId = jdResult?.jdId || localStorage.getItem('cm_jdId');
    const rId = resumeId || localStorage.getItem('cm_resumeId');

    if (!rId) {
      setMatchError('No parsed resume found. Please upload your resume first.');
      return;
    }
    if (!jId) {
      setMatchError('No analyzed job description found.');
      return;
    }

    setMatching(true);
    setMatchError('');
    try {
      const match = await api.match(rId, jId);
      localStorage.setItem('cm_matchResult', JSON.stringify(match));
      navigate('/match');
    } catch (err) {
      setMatchError(err.message || 'Match calculation failed.');
    } finally {
      setMatching(false);
    }
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 940 }}>

        {/* Pipeline Steps */}
        <div className="pipeline-steps">
          <div className="pipeline-step done">
            <div className="step-num">✓</div>
            <span>Resume Profile</span>
          </div>
          <div className="step-divider" />
          <div className={`pipeline-step ${step === 'input' ? 'active' : 'done'}`}>
            <div className="step-num">{step === 'result' ? '✓' : '2'}</div>
            <span>Job Description Ingestion</span>
          </div>
          <div className="step-divider" />
          <div className={`pipeline-step ${step === 'result' ? 'active' : ''}`}>
            <div className="step-num">3</div>
            <span>Explainable Match</span>
          </div>
        </div>

        {step === 'result' ? (
          /* Result View */
          <div className="pro-card animate-fade-in">
            <div className="pro-card-header">
              <div className="flex items-center gap-2">
                <IconCheckCircle size={18} style={{ color: 'var(--matched)' }} />
                <h3 style={{ fontSize: '1.2rem' }}>Job Description Analyzed</h3>
              </div>
              <span className="badge badge-brand">{jdResult?.company || 'Verified Company'}</span>
            </div>

            <div className="pro-card-body">
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.45rem', marginBottom: 4 }}>{jdResult?.title || title || 'Target Role'}</h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Organization: {jdResult?.company || company || 'Not specified'}</div>
              </div>

              {matchError && (
                <div className="alert alert-error animate-fade-in" style={{ marginBottom: '1.5rem' }}>
                  <IconAlertCircle size={18} />
                  <div>
                    <div>{matchError}</div>
                    {!resumeId && (
                      <Link to="/resume" style={{ fontWeight: 600, color: '#fff', textDecoration: 'underline', marginTop: 4, display: 'inline-block' }}>
                        Go to Resume Upload →
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Required Qualifications */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Required Technical Qualifications</h4>
                  <span className="badge badge-neutral">{jdResult?.requiredSkills?.length || 0} Core Skills</span>
                </div>
                <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                  {(jdResult?.requiredSkills || []).map((s) => (
                    <span key={s} className="skill-chip skill-chip-matched">
                      <IconCheck size={12} strokeWidth={2.5} />
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Preferred Skills */}
              {(jdResult?.preferredSkills || []).length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Preferred / Bonus Competencies</h4>
                    <span className="badge badge-neutral">{jdResult?.preferredSkills?.length} Preferred</span>
                  </div>
                  <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                    {jdResult.preferredSkills.map((s) => (
                      <span key={s} className="skill-chip skill-chip-preferred">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {savedJobs.length > 1 && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'rgba(124, 58, 237, 0.04)' }}>
                  <div className="flex justify-between items-center" style={{ gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ fontSize: '0.98rem' }}>Compare this role with saved jobs</h4>
                      <p style={{ fontSize: '0.8rem', marginTop: 3 }}>See which target role currently fits your resume best and why.</p>
                    </div>
                    <button type="button" className="btn btn-secondary btn-sm" disabled={comparisonLoading || selectedJobIds.length === 0} onClick={handleCompareJobs}>
                      {comparisonLoading ? 'Comparing…' : 'Compare selected'}
                    </button>
                  </div>
                  <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                    {savedJobs.filter((job) => job.jdId !== jdResult?.jdId).map((job) => (
                      <label key={job.jdId} className="skill-chip" style={{ cursor: 'pointer' }}>
                        <input type="checkbox" checked={selectedJobIds.includes(job.jdId)} onChange={() => toggleJob(job.jdId)} />
                        {job.title} {job.company ? `· ${job.company}` : ''}
                      </label>
                    ))}
                  </div>
                  {comparisons && (
                    <div className="data-table-wrapper" style={{ marginTop: '1rem' }}>
                      <table className="data-table">
                        <thead><tr><th>Role</th><th>Score</th><th>Strong skills</th><th>Priority gap</th></tr></thead>
                        <tbody>{comparisons.map((item) => <tr key={item.jdId}><td><strong>{item.title}</strong><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.company}</div></td><td><span className="badge badge-brand">{item.overallScore}%</span></td><td>{item.strengths?.slice(0, 3).join(', ') || 'None identified'}</td><td>{item.topGap || 'No priority gap'}</td></tr>)}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Next Step CTA */}
              <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="btn btn-secondary"
                >
                  <IconArrowLeft size={15} />
                  <span>Edit Job Description</span>
                </button>

                <button
                  type="button"
                  onClick={handleRunMatch}
                  className="btn btn-primary btn-lg"
                  disabled={matching}
                >
                  {matching ? (
                    <>
                      <span className="spinner" />
                      <span>Computing Match Index…</span>
                    </>
                  ) : (
                    <>
                      <span>Step 3: Run Semantic Match Engine</span>
                      <IconArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Input Form */
          <div className="pro-card animate-fade-in">
            <div className="pro-card-header">
              <div>
                <span className="badge badge-neutral" style={{ marginBottom: '0.25rem' }}>PHASE 02</span>
                <h2 style={{ fontSize: '1.4rem' }}>Job Description Intelligence</h2>
              </div>

              {/* Quick Sample Dropdown / Buttons */}
              <div className="flex gap-2">
                {SAMPLE_JDS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => loadSample(s)}
                    className="btn btn-secondary btn-sm"
                    title={`Load ${s.title}`}
                  >
                    <IconSparkles size={13} />
                    <span>Sample: {s.title.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pro-card-body">
              <p style={{ marginBottom: '1.5rem' }}>
                Paste the target job description. The parser identifies required skills, preferred competencies, and core role responsibilities to prepare for multi-factor matching.
              </p>

              {error && (
                <div className="alert alert-error animate-fade-in" style={{ marginBottom: '1.5rem' }}>
                  <IconAlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Job Title</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Senior Full-Stack Engineer"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company / Organization</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Stripe, Scale AI, Datadog"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Job Description Text</label>
                  <textarea
                    className="form-textarea"
                    rows={10}
                    placeholder="Paste the full job description text here, including requirements, qualifications, and role responsibilities…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-between items-center" style={{ marginTop: '0.5rem' }}>
                  <Link to="/resume" className="btn btn-ghost btn-sm">
                    <IconArrowLeft size={14} />
                    <span>Back to Resume</span>
                  </Link>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                    style={{ minWidth: 200 }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner" />
                        <span>Analyzing Job Spec…</span>
                      </>
                    ) : (
                      <>
                        <span>Extract Qualifications</span>
                        <IconArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
