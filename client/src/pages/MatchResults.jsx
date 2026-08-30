import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ScoreRing from '../components/ScoreRing';
import ProgressBar from '../components/ProgressBar';
import { api } from '../services/api';

function ReadinessGate({ score }) {
  if (score >= 80) return (
    <div className="badge badge-success" style={{ fontSize: '0.95rem', padding: 'var(--space-2) var(--space-5)' }}>
      ✅ Ready to Apply
    </div>
  );
  if (score >= 60) return (
    <div className="badge badge-warning" style={{ fontSize: '0.95rem', padding: 'var(--space-2) var(--space-5)' }}>
      ⚡ Apply After Minor Improvements
    </div>
  );
  if (score >= 40) return (
    <div className="badge badge-info" style={{ fontSize: '0.95rem', padding: 'var(--space-2) var(--space-5)' }}>
      📚 Build Skills Before Applying
    </div>
  );
  return (
    <div className="badge badge-error" style={{ fontSize: '0.95rem', padding: 'var(--space-2) var(--space-5)' }}>
      ❌ Low Match — Significant Gaps
    </div>
  );
}

export default function MatchResults() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [gapData, setGapData] = useState(null);
  const [loadingGap, setLoadingGap] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cm_matchResult');
    if (stored) {
      const r = JSON.parse(stored);
      setResult(r);
      // Auto-load skill gap
      if (r.matchId) {
        setLoadingGap(true);
        api.skillGap(r.matchId).then(setGapData).catch(console.error).finally(() => setLoadingGap(false));
      }
    }
  }, []);

  if (!result) {
    return (
      <div className="page-wrapper flex items-center justify-center" style={{ flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ fontSize: '3rem' }}>🔍</div>
        <h3>No match results yet</h3>
        <p>Upload your resume and analyze a job description first.</p>
        <Link to="/resume" className="btn btn-primary">Upload Resume →</Link>
      </div>
    );
  }

  const bd = result.scoringBreakdown || {};
  const factorLabels = {
    requiredSkills: 'Required Skills',
    preferredSkills: 'Preferred Skills',
    semanticMatch: 'Semantic Match',
    experienceAlignment: 'Experience Alignment',
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: 'var(--space-8) var(--space-6)' }}>
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <h1 style={{ marginBottom: 'var(--space-2)' }}>Match Analysis Report</h1>
              <p>Here's your detailed compatibility breakdown with explainable scoring.</p>
            </div>
            <ReadinessGate score={result.overallScore} />
          </div>

          {/* Hero Score + Breakdown */}
          <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
            {/* Overall Score */}
            <div className="glass-card-static" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-5)' }}>
              <h3>Overall Match Score</h3>
              <ScoreRing score={result.overallScore} size={200} label="Match" />
              <div style={{ textAlign: 'center', fontSize: '1rem', color: 'var(--text-secondary)' }}>
                {result.readiness}
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="glass-card-static" style={{ padding: 'var(--space-6)' }}>
              <h3 style={{ marginBottom: 'var(--space-2)' }}>Why This Score?</h3>
              <p style={{ fontSize: '0.85rem', marginBottom: 'var(--space-5)' }}>Factor-by-factor scoring breakdown</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {Object.entries(bd).map(([key, val]) => (
                  <ProgressBar key={key} label={factorLabels[key] || key} value={val} />
                ))}
              </div>
            </div>
          </div>

          {/* Strengths / Gaps / Preferred */}
          <div className="grid-3" style={{ marginBottom: 'var(--space-6)' }}>
            {/* Strengths */}
            <div className="glass-card-static" style={{ padding: 'var(--space-5)' }}>
              <div style={{ fontWeight: 700, marginBottom: 'var(--space-3)', color: 'var(--success)' }}>
                ✅ Matched Skills ({result.strengths?.length || 0})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {(result.strengths || []).map(s => (
                  <span key={s} className="skill-tag skill-tag-matched">{s}</span>
                ))}
                {!result.strengths?.length && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No exact matches found</span>}
              </div>
            </div>

            {/* Preferred */}
            <div className="glass-card-static" style={{ padding: 'var(--space-5)' }}>
              <div style={{ fontWeight: 700, marginBottom: 'var(--space-3)', color: 'var(--warning)' }}>
                🟡 Partial Matches ({result.matchedPreferred?.length || 0})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {(result.matchedPreferred || []).map(s => (
                  <span key={s} className="skill-tag skill-tag-partial">{s}</span>
                ))}
                {!result.matchedPreferred?.length && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No preferred skills matched</span>}
              </div>
            </div>

            {/* Gaps */}
            <div className="glass-card-static" style={{ padding: 'var(--space-5)' }}>
              <div style={{ fontWeight: 700, marginBottom: 'var(--space-3)', color: 'var(--error)' }}>
                ❌ Missing Skills ({result.gaps?.length || 0})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {(result.gaps || []).map(s => (
                  <span key={s} className="skill-tag skill-tag-missing">{s}</span>
                ))}
                {!result.gaps?.length && <span style={{ color: 'var(--success)', fontSize: '0.85rem' }}>🎉 No critical gaps!</span>}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <div className="glass-card-static" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
              <h3 style={{ marginBottom: 'var(--space-4)' }}>💡 Recommended Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {result.recommendations.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'rgba(110,86,255,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(110,86,255,0.15)' }}>
                    <span style={{ color: 'var(--accent-purple)', fontWeight: 700, minWidth: 20 }}>{i + 1}.</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skill Gap Roadmap Preview */}
          {loadingGap && (
            <div className="flex items-center gap-4" style={{ padding: 'var(--space-6)' }}>
              <span className="spinner" /> <span>Loading skill gap roadmap…</span>
            </div>
          )}
          {gapData && (
            <div className="glass-card-static" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-4)' }}>
                <h3>🗺️ Skill Gap Summary</h3>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Est. time: {gapData.estimatedTimeToReady}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {(gapData.improvementRoadmap || []).slice(0, 3).map((item) => (
                  <div key={item.skill} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <span className={`badge priority-${item.priority.toLowerCase()}`}>{item.priority}</span>
                      <span style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.9rem' }}>{item.skill}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.estimatedWeeks}w</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
            <Link to="/roadmap" className="btn btn-primary">📚 View Full Roadmap →</Link>
            <Link to="/interview" className="btn btn-secondary">🎙️ Practice Interview →</Link>
            <Link to="/jd" className="btn btn-ghost">Analyze Another Job</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
