import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getUser } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import ScoreRing from '../components/ScoreRing';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    api.getDashboard().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const widgets = data ? [
    { icon: '📄', label: 'Resume Health', value: data.resumeHealth, color: data.resumeHealth === 'Strong' ? 'var(--success)' : 'var(--warning)' },
    { icon: '🎯', label: 'Target Role', value: data.selectedRole || 'Not set', color: 'var(--accent-purple)' },
    { icon: '📚', label: 'Total Resumes', value: data.totalResumes || 0, color: 'var(--info)' },
    { icon: '🗺️', label: 'Roadmap Progress', value: `${data.roadmapProgress || 0}%`, color: 'var(--accent-violet)' },
  ] : [];

  const quickActions = [
    { to: '/resume', icon: '📤', label: 'Upload Resume', desc: 'Add or update your resume' },
    { to: '/jd', icon: '🔍', label: 'Analyze Job', desc: 'Match against a job description' },
    { to: '/roadmap', icon: '🗺️', label: 'View Roadmap', desc: 'Track your skill progress' },
    { to: '/interview', icon: '🎙️', label: 'Practice Interview', desc: 'Adaptive mock questions' },
    { to: '/applications', icon: '📋', label: 'Applications', desc: 'Track your job applications' },
  ];

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: 'var(--space-8) var(--space-6)' }}>
        {/* Header */}
        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem' }}>
              Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'there'}</span> 👋
            </h1>
            <p>Here's your career intelligence overview</p>
          </div>
          <Link to="/resume" className="btn btn-primary">+ Upload Resume</Link>
        </div>

        {loading ? (
          <div className="flex justify-center" style={{ padding: 'var(--space-16)' }}>
            <span className="spinner" style={{ width: 40, height: 40 }} />
          </div>
        ) : (
          <>
            {/* Stat Widgets */}
            <div className="grid-4" style={{ marginBottom: 'var(--space-8)' }}>
              {widgets.map((w) => (
                <div key={w.label} className="glass-card" style={{ padding: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <div style={{ fontSize: '1.8rem' }}>{w.icon}</div>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: w.color }}>{w.value}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{w.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content: Score + Gaps */}
            <div className="grid-2" style={{ marginBottom: 'var(--space-8)' }}>
              {/* Interview Readiness */}
              <div className="glass-card-static" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
                <h3 style={{ alignSelf: 'flex-start' }}>Interview Readiness</h3>
                <ScoreRing score={data?.interviewReadiness || 0} label="Readiness" size={160} />
                <div style={{ width: '100%' }}>
                  <ProgressBar label="Technical" value={78} />
                  <div style={{ height: 'var(--space-3)' }} />
                  <ProgressBar label="Behavioral" value={72} />
                  <div style={{ height: 'var(--space-3)' }} />
                  <ProgressBar label="Resume Defense" value={86} />
                </div>
              </div>

              {/* Critical Skill Gaps */}
              <div className="glass-card-static" style={{ padding: 'var(--space-6)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)' }}>Critical Skill Gaps</h3>
                {data?.criticalSkillGaps?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {data.criticalSkillGaps.map((skill, i) => (
                      <div key={skill} className="glass-card" style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.9rem' }}>{skill}</span>
                        <span className={`badge ${i === 0 ? 'badge-error' : 'badge-warning'}`}>{i === 0 ? 'Critical' : 'High'}</span>
                      </div>
                    ))}
                    <Link to="/roadmap" className="btn btn-secondary btn-sm" style={{ marginTop: 'var(--space-2)', textAlign: 'center' }}>
                      View Full Roadmap →
                    </Link>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>🎉</div>
                    <p>No critical gaps detected. Upload a resume and match a JD to see gaps.</p>
                    <Link to="/jd" className="btn btn-primary btn-sm" style={{ marginTop: 'var(--space-4)' }}>Match a Job →</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 style={{ marginBottom: 'var(--space-4)' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
                {quickActions.map((a) => (
                  <Link to={a.to} key={a.to} className="glass-card" style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', cursor: 'pointer', textDecoration: 'none' }}>
                    <div style={{ fontSize: '1.6rem' }}>{a.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{a.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.desc}</div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
