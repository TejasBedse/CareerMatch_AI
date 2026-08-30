import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const SAMPLE_RESUME = `John Smith
john.smith@email.com | +1 (555) 123-4567 | linkedin.com/in/johnsmith

SUMMARY
Data Science graduate with strong proficiency in Python, SQL, and machine learning. Experience building predictive models and data pipelines. Passionate about turning data into actionable insights.

EDUCATION
B.Tech in Computer Science (Data Science)
Tech University | 2022–2026 | CGPA: 8.4/10

SKILLS
Programming: Python, SQL, JavaScript, R
ML/AI: Scikit-learn, Pandas, NumPy, TensorFlow (basics), NLP
Data: Tableau, Power BI, Excel, ETL pipelines
Tools: Git, Docker (basics), Jupyter, VS Code, Postman
Other: REST APIs, Agile, Linux

EXPERIENCE
Data Science Intern | DataCorp Inc. | Jun 2025 – Aug 2025
• Built a churn prediction model (Python, Scikit-learn) achieving 87% accuracy
• Created automated ETL pipeline reducing data processing time by 40%
• Developed Tableau dashboards for executive reporting

PROJECTS
Resume Matcher (2025)
• Built NLP tool to match resumes to job descriptions using BERT embeddings
• Python, Hugging Face, REST API backend

Sales Analytics Dashboard (2024)
• Interactive Power BI dashboard with 15+ KPI visualizations
• SQL Server backend with optimized queries

CERTIFICATIONS
• Google Data Analytics Certificate (2024)
• SQL for Data Science – Coursera (2024)`;

export default function ResumeUpload() {
  const navigate = useNavigate();
  const [step, setStep] = useState('input'); // input | result
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) { setError('Please paste your resume text.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await api.uploadResume(text, name, role);
      // Store resumeId for later use
      localStorage.setItem('cm_resumeId', res.resumeId);
      localStorage.setItem('cm_resumeProfile', JSON.stringify(res.parsedProfile));
      setResult(res);
      setStep('result');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (step === 'result' && result) {
    const p = result.parsedProfile;
    return (
      <div className="page-wrapper">
        <div className="container-sm" style={{ padding: 'var(--space-8) var(--space-6)' }}>
          <div className="animate-fade-in-up">
            <div className="alert alert-success" style={{ marginBottom: 'var(--space-6)' }}>
              ✅ Resume parsed successfully! Resume ID: <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{result.resumeId?.slice(0, 8)}…</code>
            </div>

            <h2 style={{ marginBottom: 'var(--space-2)' }}>Parsed Resume Profile</h2>
            <p style={{ marginBottom: 'var(--space-6)' }}>Review the extracted information below.</p>

            {/* Candidate Name */}
            <div className="glass-card-static" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Candidate</div>
              <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{p.candidateName}</div>
            </div>

            {/* Skills */}
            <div className="glass-card-static" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
                Detected Skills ({p.skills?.length || 0})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {(p.skills || []).map(s => (
                  <span key={s} className="skill-tag skill-tag-neutral">{s}</span>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="glass-card-static" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Education</div>
              <div style={{ fontSize: '0.9rem' }}>{p.education}</div>
            </div>

            {/* Experience */}
            <div className="glass-card-static" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Experience</div>
              <div style={{ fontSize: '0.9rem' }}>{p.experience}</div>
            </div>

            <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => setStep('input')}>← Edit Resume</button>
              <button className="btn btn-primary" onClick={() => navigate('/jd')}>Continue to Job Match →</button>
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
          <h1 style={{ marginBottom: 'var(--space-2)' }}>Upload Your Resume</h1>
          <p style={{ marginBottom: 'var(--space-8)' }}>Paste your resume text. Our AI will extract skills, education, and experience automatically.</p>

          {error && <div className="alert alert-error" style={{ marginBottom: 'var(--space-5)' }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="grid-2" style={{ gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="cand-name">Your Name (optional)</label>
                <input id="cand-name" className="form-input" type="text" placeholder="e.g. Alex Johnson" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="target-role">Target Role (optional)</label>
                <input id="target-role" className="form-input" type="text" placeholder="e.g. Data Scientist" value={role} onChange={e => setRole(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-2)' }}>
                <label className="form-label" htmlFor="resume-text">Resume Text</label>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setText(SAMPLE_RESUME)}>
                  Load Sample →
                </button>
              </div>
              <textarea
                id="resume-text"
                className="form-input"
                placeholder="Paste your full resume text here (PDF copy-paste works great)…"
                value={text}
                onChange={e => setText(e.target.value)}
                style={{ minHeight: 320, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.6 }}
              />
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {text.length} characters · ~{Math.round(text.split(' ').length)} words
              </div>
            </div>

            <button id="resume-upload-btn" type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 20, height: 20 }} /> Analyzing Resume…</> : 'Parse Resume & Continue →'}
            </button>
          </form>

          {/* Tips */}
          <div className="glass-card-static" style={{ padding: 'var(--space-5)', marginTop: 'var(--space-6)' }}>
            <div style={{ fontWeight: 700, marginBottom: 'var(--space-3)', fontSize: '0.9rem' }}>💡 Tips for best results</div>
            <ul style={{ paddingLeft: 'var(--space-4)', color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <li>Include skills, education, experience, and project sections</li>
              <li>Use clear section headings (Skills, Education, Experience, Projects)</li>
              <li>Copy from a PDF or Word document for best extraction</li>
              <li>Try the "Load Sample" button to see how it works</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
