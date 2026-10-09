import { Link } from 'react-router-dom';
import SectionImage from '../components/SectionImage';
import {
  IconArrowLeft,
  IconArrowRight,
  IconBarChart,
  IconCheckCircle,
  IconCompass,
  IconFileText,
  IconMic,
  IconShieldCheck,
  IconSparkles,
  IconTarget,
} from '../components/Icons';

const MODULES = [
  {
    icon: IconFileText,
    title: 'Resume Intelligence',
    text: 'Parses PDF, DOCX, TXT, and scanned image resumes into skills, experience, education, and evidence.',
  },
  {
    icon: IconTarget,
    title: 'Explainable Job Matching',
    text: 'Uses EAMS to show how skill match, semantic alignment, experience, project evidence, and requirement importance affect the score.',
  },
  {
    icon: IconCompass,
    title: 'Skill Gap Roadmap',
    text: 'Turns missing requirements into prioritized learning, practice, project, and interview actions.',
  },
  {
    icon: IconMic,
    title: 'Adaptive Interview Prep',
    text: 'Creates role-specific questions, evaluates answers, identifies weak areas, and adapts the next question.',
  },
];

const STACK = ['React + Vite', 'Node.js + Express', 'JWT authentication', 'PDF/DOCX parsing', 'Tesseract OCR fallback', 'EAMS scoring services'];

export default function ProjectDetails() {
  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 1040 }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="inline-flex items-center gap-2 badge badge-brand" style={{ marginBottom: '0.5rem' }}>
              <IconSparkles size={13} />
              <span>ABOUT THE PROJECT</span>
            </div>
            <h1>CareerMatch AI</h1>
            <p style={{ maxWidth: 680, marginTop: '0.5rem' }}>
              An evidence-aware career intelligence platform that helps candidates understand what their resume proves, how it matches a job, and what to improve next.
            </p>
          </div>
          <Link to="/dashboard" className="btn btn-secondary btn-sm">
            <IconArrowLeft size={14} />
            <span>Back to dashboard</span>
          </Link>
        </div>

        <SectionImage
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80"
          alt="A group collaborating around a table with laptops"
          title="CareerMatch AI Platform"
        />

        <section className="pro-card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(255, 255, 255, 0.7))' }}>
          <div className="pro-card-body" style={{ padding: '2rem' }}>
            <div className="grid-2" style={{ alignItems: 'center', gap: '2rem' }}>
              <div>
                <span className="badge badge-success" style={{ marginBottom: '0.75rem' }}><span className="badge-dot" /> Evidence → Explanation → Action</span>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '0.7rem' }}>More than an ATS checker</h2>
                <p>
                  CareerMatch AI combines structured resume understanding, job-description analysis, deterministic scoring, evidence verification, personalized roadmaps, and interview practice in one workflow.
                </p>
              </div>
              <div className="pro-card" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.65)' }}>
                <div className="flex items-center gap-2" style={{ marginBottom: '0.8rem' }}><IconBarChart size={16} style={{ color: 'var(--brand-primary)' }} /><strong>Core research idea: EAMS</strong></div>
                <p style={{ fontSize: '0.84rem' }}>Evidence-Aware Multi-Factor Scoring explains why a candidate is suitable instead of returning only a keyword percentage.</p>
                <div style={{ marginTop: '0.8rem', fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>30% skills · 30% semantics · 15% experience · 15% projects · 10% importance</div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
          {MODULES.map(({ icon: Icon, title, text }) => (
            <article key={title} className="pro-card">
              <div className="pro-card-body" style={{ padding: '1.35rem' }}>
                <div className="flex items-center gap-3" style={{ marginBottom: '0.7rem' }}>
                  <div className="brand-icon-box" style={{ width: 36, height: 36 }}><Icon size={17} /></div>
                  <h3 style={{ fontSize: '1rem' }}>{title}</h3>
                </div>
                <p style={{ fontSize: '0.84rem' }}>{text}</p>
              </div>
            </article>
          ))}
        </div>

        <section className="pro-card" style={{ marginBottom: '1.5rem' }}>
          <div className="pro-card-header">
            <div><h3 style={{ fontSize: '1.08rem' }}>What makes the analysis trustworthy?</h3><p style={{ fontSize: '0.82rem', marginTop: 3 }}>The system is designed to keep recommendations grounded in candidate evidence.</p></div>
            <IconShieldCheck size={22} style={{ color: 'var(--matched)' }} />
          </div>
          <div className="pro-card-body">
            <div className="grid-3">
              {['Scores are deterministic and explainable', 'Missing evidence is separated from missing skills', 'Resume suggestions are marked for verification'].map((item) => <div key={item} className="flex items-start gap-2"><IconCheckCircle size={15} style={{ color: 'var(--matched)', flexShrink: 0, marginTop: 3 }} /><span style={{ fontSize: '0.83rem' }}>{item}</span></div>)}
            </div>
          </div>
        </section>

        <section className="pro-card" style={{ marginBottom: '1.5rem' }}>
          <div className="pro-card-header"><div><h3 style={{ fontSize: '1.08rem' }}>Technology foundation</h3><p style={{ fontSize: '0.82rem', marginTop: 3 }}>Built for local development with optional AI and OCR capabilities.</p></div></div>
          <div className="pro-card-body"><div className="flex gap-2" style={{ flexWrap: 'wrap' }}>{STACK.map((item) => <span className="skill-chip skill-chip-matched" key={item}>{item}</span>)}</div></div>
        </section>

        <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontSize: '0.8rem' }}>CareerMatch AI is decision support, not a hiring or employment guarantee.</p>
          <Link to="/jd" className="btn btn-primary btn-sm"><span>Try the job matcher</span><IconArrowRight size={14} /></Link>
        </div>
      </div>
    </div>
  );
}
