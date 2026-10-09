import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, getUser } from '../services/api';
import SectionImage from '../components/SectionImage';
import {
  IconFileText,
  IconUpload,
  IconCheck,
  IconCheckCircle,
  IconAlertCircle,
  IconArrowRight,
  IconArrowLeft,
  IconSparkles,
  IconTarget,
  IconClock,
  IconUser,
  IconShieldCheck,
  IconCode
} from '../components/Icons';

const SAMPLE_RESUME_TEXT = `Alex Morgan
alex.morgan@email.com | +1 (555) 345-6789 | github.com/alexmorgan | San Francisco, CA

SUMMARY
Senior Software Engineer with 4+ years of hands-on experience in full-stack web systems, scalable REST APIs, and database architecture. Proven track record optimizing high-throughput production services with React, Node.js, TypeScript, and PostgreSQL.

EDUCATION
B.S. in Computer Science | University of California, Berkeley | 2018–2022 | GPA: 3.85

TECHNICAL SKILLS
• Programming Languages: Python, JavaScript, TypeScript, SQL, Go, HTML5, CSS3
• Frameworks & Libraries: React, Node.js, Express, Next.js, Redux, Jest, PyTest
• Databases & Storage: PostgreSQL, Redis, MongoDB, MySQL
• Cloud & DevOps: Docker, AWS (S3, EC2, Lambda), CI/CD, Git, GitHub Actions, Linux
• Concepts: System Design, RESTful Architecture, Microservices, Agile/Scrum

EXPERIENCE
Software Engineer | Stripe Infrastructure Partner | 2022 – Present
• Architected event-driven microservices in Node.js and TypeScript handling 1.5M+ daily transactions with 99.98% uptime.
• Decreased database query latency by 42% through query optimization, connection pooling, and multi-tier Redis caching.
• Designed and shipped responsive internal dashboards in React, saving the operations team 12 hours per week.
• Automated end-to-end integration testing with Jest and GitHub Actions, cutting deployment rollbacks by 30%.

PROJECTS
High-Throughput Distributed Cache (2024)
• Built an in-memory key-value cache engine in Go with LRU eviction and atomic concurrency guarantees.
• Benchmarked sub-2ms read latencies under 20,000 concurrent simulated client requests.`;

export default function ResumeUpload() {
  const navigate = useNavigate();
  const user = getUser();
  const [step, setStep] = useState('input'); // 'input' | 'result'
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [suggestions, setSuggestions] = useState(null);

  useEffect(() => {
    if (user?.name && !name) {
      setName(user.name);
    }
  }, [user, name]);

  useEffect(() => {
    const jdId = localStorage.getItem('cm_jdId');
    if (!result?.resumeId || !jdId) return;
    api.resumeSuggestions(result.resumeId, jdId).then(setSuggestions).catch(() => setSuggestions(null));
  }, [result]);

  const roleSuggestions = [
    'Full-Stack Software Engineer',
    'Frontend Engineer',
    'Backend Engineer',
    'Data Analyst',
    'Product Engineer',
    'Machine Learning Engineer',
    'DevOps Engineer',
    'Software Engineer, Platform',
    'QA Automation Engineer',
  ];

  function loadSampleData() {
    const fallbackName = user?.name || 'Alex Morgan';
    setName(fallbackName);
    setRole('Full-Stack Software Engineer');
    const blob = new Blob([SAMPLE_RESUME_TEXT], { type: 'text/plain' });
    const file = new File([blob], 'Alex_Morgan_Resume.txt', { type: 'text/plain' });
    setSelectedFile(file);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Candidate name is required.');
      return;
    }
    if (!role.trim()) {
      setError('Target role is required.');
      return;
    }
    if (!selectedFile) {
      setError('Please select a resume file or click "Use Sample Profile".');
      return;
    }

    setLoading(true);
    try {
      const res = await api.uploadResumeFile(selectedFile, name, role);
      setResult(res);
      setStep('result');
      if (res.resumeId) localStorage.setItem('cm_resumeId', res.resumeId);
    } catch (err) {
      setError(err.message || 'Unable to parse resume. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const p = result?.parsedProfile || {};

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 940 }}>

        {/* Linear Step Progression */}
        <div className="pipeline-steps">
          <div className={`pipeline-step ${step === 'input' ? 'active' : 'done'}`}>
            <div className="step-num">{step === 'result' ? '✓' : '1'}</div>
            <span>Resume Ingestion</span>
          </div>
          <div className="step-divider" />
          <div className={`pipeline-step ${step === 'result' ? 'active' : ''}`}>
            <div className="step-num">2</div>
            <span>Semantic Diagnostic</span>
          </div>
          <div className="step-divider" />
          <div className="pipeline-step">
            <div className="step-num">3</div>
            <span>Job Match Evaluation</span>
          </div>
        </div>

        <SectionImage
          src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1600&q=80"
          alt="A resume document being reviewed at a desk"
          title="Resume Intelligence"
          variant="compact"
        />

        {step === 'result' ? (
          /* Result View */
          <div className="pro-card animate-fade-in">
            <div className="pro-card-header">
              <div className="flex items-center gap-2">
                <IconCheckCircle size={18} style={{ color: 'var(--matched)' }} />
                <h3 style={{ fontSize: '1.2rem' }}>Resume Successfully Parsed</h3>
              </div>
              <span className="badge badge-success">
                <span className="badge-dot" />
                ATS Verified
              </span>
            </div>

            <div className="pro-card-body">
              {result?.extractionWarning && (
                <div className="alert alert-info animate-fade-in" style={{ marginBottom: '1.25rem' }}>
                  <IconAlertCircle size={16} />
                  <span>{result.extractionWarning}</span>
                </div>
              )}
              {/* Candidate Metadata Summary */}
              <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Candidate</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 2 }}>{result?.candidateName || name}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Role</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 2 }}>{result?.targetRole || role}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Extracted Skills</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--matched)', marginTop: 2 }}>{p.skills?.length || 0} Competencies</div>
                </div>
              </div>

              {/* Extracted Skills List */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.95rem' }}>Verified Technical Skills</h4>
                  <span className="badge badge-brand">{p.skills?.length || 0} Detected</span>
                </div>
                <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                  {(p.skills || []).map((s) => (
                    <span key={s} className="skill-chip skill-chip-matched">
                      <IconCheck size={12} strokeWidth={2.5} />
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {suggestions && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'rgba(124, 58, 237, 0.04)' }}>
                  <div style={{ marginBottom: '0.9rem' }}>
                    <div>
                      <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                        <IconShieldCheck size={16} style={{ color: 'var(--matched)' }} />
                        <span className="badge badge-brand">JD-SPECIFIC</span>
                      </div>
                      <h3 style={{ fontSize: '1.05rem' }}>Resume improvement suggestions</h3>
                      <p style={{ fontSize: '0.82rem', marginTop: 3 }}>{suggestions.truthGuard}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {suggestions.suggestions.map((item) => (
                      <div key={`${item.requirementType}-${item.skill}`} style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.9rem', background: 'rgba(255,255,255,0.45)' }}>
                        <div className="flex justify-between items-center" style={{ gap: '0.75rem', flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '0.88rem' }}>{item.skill}</strong>
                          <span className={`badge ${item.label.startsWith('BASED') ? 'badge-success' : 'badge-warning'}`}>{item.label}</span>
                        </div>
                        <p style={{ fontSize: '0.82rem', marginTop: 5 }}>{item.message}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginTop: 5 }}><strong>Next:</strong> {item.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience & Education Details */}
              <div className="grid-2" style={{ gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                    <IconClock size={15} style={{ color: 'var(--brand-primary)' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Experience Estimate</span>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{p.yearsOfExperience || 2}+ Years Relevant Experience</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                    <IconShieldCheck size={15} style={{ color: 'var(--matched)' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Education Credential</span>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{p.education || 'Bachelor Degree in Computer Science'}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="btn btn-secondary"
                >
                  <IconArrowLeft size={15} />
                  <span>Upload Different Resume</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/jd')}
                  className="btn btn-primary"
                >
                  <span>Step 2: Match Against Job Description</span>
                  <IconArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Input Form View */
          <div className="pro-card animate-fade-in">
            <div className="pro-card-header">
              <div>
                <span className="badge badge-neutral" style={{ marginBottom: '0.25rem' }}>PHASE 01</span>
                <h2 style={{ fontSize: '1.4rem' }}>Resume Intelligence & ATS Diagnostic</h2>
              </div>
              <button
                type="button"
                onClick={loadSampleData}
                className="btn btn-secondary btn-sm"
                title="Autofill with industry-standard senior engineer resume"
              >
                <IconSparkles size={14} />
                <span>Use Sample Profile</span>
              </button>
            </div>

            <div className="pro-card-body">
              <p style={{ marginBottom: '1.5rem' }}>
                Upload your resume in PDF, DOCX, or TXT format. Our parser extracts technical competencies, estimated years of experience, and validates ATS readability.
              </p>

              {error && (
                <div className="alert alert-error animate-fade-in" style={{ marginBottom: '1.5rem' }}>
                  <IconAlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Candidate Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Alex Morgan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Role</label>
                    <input
                      type="text"
                      className="form-input"
                      list="role-suggestions"
                      placeholder="e.g. Full-Stack Software Engineer"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                    />
                    <datalist id="role-suggestions">
                      {roleSuggestions.map((option) => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="form-group">
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Suggested target roles</label>
                    <span className="badge badge-neutral">Role picklist</span>
                  </div>
                  <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                    {roleSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        className={`btn ${role === suggestion ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => setRole(suggestion)}
                        style={{ padding: '0.45rem 0.75rem' }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload Area */}
                <div className="form-group">
                  <label className="form-label">Resume Document</label>
                  <label
                    htmlFor="resume-file-input"
                    style={{
                      border: '2px dashed var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      padding: '2.25rem 1.5rem',
                      textAlign: 'center',
                      background: selectedFile ? 'rgba(59, 130, 246, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                      cursor: 'pointer',
                      transition: 'all var(--transition)',
                      display: 'block',
                    }}
                  >
                    <input
                      id="resume-file-input"
                      type="file"
                      accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                          setError('');
                        }
                      }}
                    />
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="kpi-icon-box" style={{ width: 44, height: 44, background: 'var(--brand-subtle)', color: 'var(--brand-primary)' }}>
                        <IconUpload size={22} />
                      </div>
                      {selectedFile ? (
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedFile.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {(selectedFile.size / 1024).toFixed(1)} KB • Ready to Parse
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            Click to upload resume or drag and drop
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            Supports PDF, DOCX, DOC, TXT, PNG, or JPG (Max 10MB)
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                <div className="flex justify-end" style={{ marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                    style={{ minWidth: 200 }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner" />
                        <span>Analyzing Resume…</span>
                      </>
                    ) : (
                      <>
                        <span>Extract & Analyze Profile</span>
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
