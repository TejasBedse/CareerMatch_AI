import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import ProgressBar from '../components/ProgressBar';

const STATUSES = ['Not Started', 'Learning', 'Practicing', 'Demonstrated'];
const STATUS_COLORS = {
  'Not Started': 'var(--text-muted)',
  'Learning': 'var(--info)',
  'Practicing': 'var(--warning)',
  'Demonstrated': 'var(--success)',
};

export default function SkillRoadmap() {
  const [roadmap, setRoadmap] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({}); // { skill: status }

  useEffect(() => {
    const matchResult = localStorage.getItem('cm_matchResult');
    if (matchResult) {
      const { matchId } = JSON.parse(matchResult);
      api.skillGap(matchId)
        .then(data => {
          setSummary(data);
          setRoadmap(data.improvementRoadmap || []);
          // Load saved progress
          const saved = {};
          (data.improvementRoadmap || []).forEach(item => {
            saved[item.skill] = localStorage.getItem(`roadmap_${item.skill}`) || 'Not Started';
          });
          setProgress(saved);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  function updateStatus(skill, status) {
    const newProgress = { ...progress, [skill]: status };
    setProgress(newProgress);
    localStorage.setItem(`roadmap_${skill}`, status);
    api.updateProgress(skill, status).catch(console.error);
  }

  function getProgressValue(status) {
    const map = { 'Not Started': 0, 'Learning': 33, 'Practicing': 66, 'Demonstrated': 100 };
    return map[status] || 0;
  }

  const totalSkills = roadmap.length;
  const demonstratedCount = Object.values(progress).filter(v => v === 'Demonstrated').length;
  const overallPct = totalSkills > 0 ? Math.round((demonstratedCount / totalSkills) * 100) : 0;

  if (loading) {
    return (
      <div className="page-wrapper flex items-center justify-center">
        <span className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!roadmap.length) {
    return (
      <div className="page-wrapper flex items-center justify-center" style={{ flexDirection: 'column', gap: 'var(--space-4)', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>🗺️</div>
        <h3>No roadmap yet</h3>
        <p>Match your resume with a job to generate a personalized skill roadmap.</p>
        <Link to="/jd" className="btn btn-primary">Analyze a Job →</Link>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: 'var(--space-8) var(--space-6)' }}>
        <div className="animate-fade-in-up">
          {/* Header */}
          <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <h1 style={{ marginBottom: 'var(--space-2)' }}>Skill Gap Roadmap</h1>
              <p>Your personalized action plan to close skill gaps and become job-ready.</p>
            </div>
            <div className="glass-card-static" style={{ padding: 'var(--space-4) var(--space-6)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {demonstratedCount}/{totalSkills}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Demonstrated</div>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="glass-card-static" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-3)' }}>
              <span style={{ fontWeight: 600 }}>Overall Roadmap Progress</span>
              {summary?.estimatedTimeToReady && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  ⏱️ Est. {summary.estimatedTimeToReady} remaining
                </span>
              )}
            </div>
            <ProgressBar value={overallPct} showPercent={true} height={12} />
          </div>

          {/* Roadmap Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {roadmap.map((item, idx) => {
              const status = progress[item.skill] || 'Not Started';
              const pct = getProgressValue(status);
              const isDemo = status === 'Demonstrated';

              return (
                <div key={item.skill} className="glass-card-static" style={{ padding: 'var(--space-6)', opacity: isDemo ? 0.75 : 1 }}>
                  {/* Header */}
                  <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                    <div className="flex items-center gap-4">
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: item.priority === 'Critical' ? 'rgba(255,77,109,0.2)' : item.priority === 'High' ? 'rgba(255,179,71,0.2)' : 'rgba(0,212,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.9rem',
                        color: item.priority === 'Critical' ? 'var(--error)' : item.priority === 'High' ? 'var(--warning)' : 'var(--info)',
                      }}>
                        {idx + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{item.skill}</div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 4 }}>
                          <span className={`badge priority-${item.priority?.toLowerCase()}`}>{item.priority}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>~{item.estimatedWeeks} weeks</span>
                        </div>
                      </div>
                    </div>
                    {isDemo && <span style={{ fontSize: '1.2rem' }}>✅</span>}
                  </div>

                  {/* Progress Tracker */}
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <ProgressBar value={pct} height={6} />
                  </div>

                  {/* Status Buttons */}
                  <div className="flex gap-2" style={{ marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
                    {STATUSES.map(s => (
                      <button
                        key={s}
                        className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-secondary'}`}
                        style={status === s ? {} : { borderColor: STATUS_COLORS[s], color: STATUS_COLORS[s] }}
                        onClick={() => updateStatus(item.skill, s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  {/* Resources + Projects */}
                  <div className="grid-2" style={{ gap: 'var(--space-4)' }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>📚 Learning Resources</div>
                      <ul style={{ paddingLeft: 'var(--space-4)', color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                        {(item.resources || []).slice(0, 3).map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>🛠️ Practice Projects</div>
                      <ul style={{ paddingLeft: 'var(--space-4)', color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                        {(item.practiceProjects || []).map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next Steps */}
          {summary?.nextSteps?.length > 0 && (
            <div className="glass-card-static" style={{ padding: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
              <h3 style={{ marginBottom: 'var(--space-4)' }}>⚡ Immediate Next Steps</h3>
              <ol style={{ paddingLeft: 'var(--space-5)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {summary.nextSteps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
