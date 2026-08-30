import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const SAMPLE_JD = `Job Title: Data Scientist
Company: TechCorp Analytics
Location: Bangalore, India (Hybrid)

About the Role:
We are looking for a talented Data Scientist to join our growing analytics team. You will work on building machine learning models, analyzing large datasets, and creating data-driven solutions for our clients.

Requirements:
• 1-3 years of experience with Python and machine learning
• Strong proficiency in SQL and database querying
• Experience with Scikit-learn, Pandas, and NumPy
• Knowledge of machine learning algorithms (regression, classification, clustering)
• Experience with data visualization tools (Tableau, Power BI, or Matplotlib)
• Familiarity with REST APIs and data pipelines
• Bachelor's degree in Computer Science, Statistics, or related field

Preferred Qualifications:
• Experience with deep learning frameworks (TensorFlow, PyTorch)
• Knowledge of cloud platforms (AWS, GCP, or Azure)
• Experience with Docker and containerization
• Knowledge of NLP and text analytics

Responsibilities:
• Develop and deploy machine learning models
• Analyze large datasets to identify patterns and insights
• Create dashboards and visualizations for stakeholders
• Collaborate with engineering teams on data pipeline development
• Present findings to non-technical stakeholders
• Document models and methodologies

What We Offer:
• Competitive salary
• Flexible work hours
• Learning & development budget
• Health insurance`;

export default function JdAnalyzer() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('input'); // input | result
  const [jdResult, setJdResult] = useState(null);
  const [matching, setMatching] = useState(false);
  const [matchError, setMatchError] = useState('');

  async function handleAnalyze(e) {
    e.preventDefault();
    if (!text.trim()) { setError('Please paste a job description.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await api.analyzeJd(title, company, text);
      localStorage.setItem('cm_jdId', res.jdId);
      setJdResult(res);
      setStep('result');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMatch() {
    const resumeId = localStorage.getItem('cm_resumeId');
    if (!resumeId) {
      setMatchError('Please upload your resume first.');
      return;
    }
    setMatchError('');
    setMatching(true);
    try {
      const res = await api.match(resumeId, jdResult.jdId);
      localStorage.setItem('cm_matchResult', JSON.stringify(res));
      navigate('/match');
    } catch (err) {
      setMatchError(err.message);
    } finally {
      setMatching(false);
    }
  }

  if (step === 'result' && jdResult) {
    return (
      <div className="page-wrapper">
        <div className="container-sm" style={{ padding: 'var(--space-8) var(--space-6)' }}>
          <div className="animate-fade-in-up">
            <div className="alert alert-success" style={{ marginBottom: 'var(--space-6)' }}>
              ✅ Job description analyzed successfully!
            </div>

            <h2 style={{ marginBottom: 'var(--space-2)' }}>{jdResult.title}</h2>
            <p style={{ marginBottom: 'var(--space-6)', color: 'var(--accent-purple)' }}>{jdResult.company}</p>

            {/* Required Skills */}
            <div className="glass-card-static" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--error)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
                Required Skills ({jdResult.requiredSkills?.length || 0})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {(jdResult.requiredSkills || []).map(s => (
                  <span key={s} className="skill-tag skill-tag-missing">🔴 {s}</span>
                ))}
              </div>
            </div>

            {/* Preferred Skills */}
            {jdResult.preferredSkills?.length > 0 && (
              <div className="glass-card-static" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
                  Preferred Skills ({jdResult.preferredSkills?.length || 0})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {(jdResult.preferredSkills || []).map(s => (
                    <span key={s} className="skill-tag skill-tag-partial">🟡 {s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Responsibilities */}
            {jdResult.responsibilities?.length > 0 && (
              <div className="glass-card-static" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--info)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
                  Key Responsibilities
                </div>
                <ul style={{ paddingLeft: 'var(--space-4)', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {jdResult.responsibilities.slice(0, 6).map((r, i) => (
                    <li key={i}>{r.trim()}</li>
                  ))}
                </ul>
              </div>
            )}

            {matchError && <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>{matchError}</div>}

            <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => setStep('input')}>← Edit JD</button>
              <button id="run-match-btn" className="btn btn-primary" onClick={handleMatch} disabled={matching}>
                {matching ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Running Match…</> : '⚡ Run Match Analysis →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container-sm" style={{ padding: 'var(--space-8) var(--space-6)' }}>
        <div className="animate-fade-in-up">
          <h1 style={{ marginBottom: 'var(--space-2)' }}>Analyze Job Description</h1>
          <p style={{ marginBottom: 'var(--space-8)' }}>Paste any job description. AI will extract required skills, preferred skills, and responsibilities.</p>

          {error && <div className="alert alert-error" style={{ marginBottom: 'var(--space-5)' }}>{error}</div>}

          <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="grid-2" style={{ gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="jd-title">Job Title (optional)</label>
                <input id="jd-title" className="form-input" type="text" placeholder="e.g. Data Scientist" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="jd-company">Company (optional)</label>
                <input id="jd-company" className="form-input" type="text" placeholder="e.g. TechCorp" value={company} onChange={e => setCompany(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-2)' }}>
                <label className="form-label" htmlFor="jd-text">Job Description Text</label>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setText(SAMPLE_JD); setTitle('Data Scientist'); setCompany('TechCorp Analytics'); }}>
                  Load Sample →
                </button>
              </div>
              <textarea
                id="jd-text"
                className="form-input"
                placeholder="Paste the full job description here…"
                value={text}
                onChange={e => setText(e.target.value)}
                style={{ minHeight: 320, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.6 }}
              />
            </div>

            <button id="analyze-jd-btn" type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 20, height: 20 }} /> Analyzing JD…</> : 'Analyze Job Description →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
