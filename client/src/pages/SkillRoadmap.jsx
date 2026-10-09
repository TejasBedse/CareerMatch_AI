import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import SectionImage from '../components/SectionImage';
import {
  IconCompass,
  IconClock,
  IconCheckCircle,
  IconExternalLink,
  IconCode,
  IconLayers,
  IconArrowRight,
  IconTarget
} from '../components/Icons';

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Practicing', 'Demonstrated'];

const DEFAULT_CURRICULUM = [
  {
    phase: 'Phase 1: Architecture & Data Modeling',
    desc: 'Core type safety, relational database performance, and transaction handling.',
    skills: [
      {
        skill: 'TypeScript / Advanced JavaScript',
        difficulty: 'Intermediate',
        hours: '14 hrs',
        reason: 'Required for type-safe full-stack application architecture and reduced runtime exceptions.',
        resources: [
          { title: 'TypeScript Official Handbook', url: 'https://www.typescriptlang.org/docs/' },
          { title: 'Full-Stack Type Systems Guide', url: 'https://github.com' },
        ],
      },
      {
        skill: 'PostgreSQL & Relational Indexing',
        difficulty: 'Intermediate',
        hours: '18 hrs',
        reason: 'Enterprise backends demand indexed query plans, transaction isolation, and connection pooling.',
        resources: [
          { title: 'PostgreSQL Official Documentation', url: 'https://www.postgresql.org/docs/' },
          { title: 'Use The Index, Luke (SQL Performance)', url: 'https://use-the-index-luke.com/' },
        ],
      },
    ],
  },
  {
    phase: 'Phase 2: Cloud Deployment & Reliability',
    desc: 'Containerization, automated build pipelines, and production infrastructure.',
    skills: [
      {
        skill: 'Docker Containerization',
        difficulty: 'Intermediate',
        hours: '12 hrs',
        reason: 'Industry standard for reproducible microservices, multi-stage builds, and deployment images.',
        resources: [
          { title: 'Docker Getting Started & Best Practices', url: 'https://docs.docker.com/get-started/' },
        ],
      },
      {
        skill: 'CI/CD & Automated Testing',
        difficulty: 'Advanced',
        hours: '16 hrs',
        reason: 'Ensures automated test coverage with Jest/Playwright and zero-downtime continuous deployment.',
        resources: [
          { title: 'GitHub Actions Documentation', url: 'https://docs.github.com/en/actions' },
        ],
      },
    ],
  },
  {
    phase: 'Phase 3: High-Throughput System Design',
    desc: 'Distributed caching, API rate limiting, and technical architecture defense.',
    skills: [
      {
        skill: 'System Design & Redis Caching',
        difficulty: 'Advanced',
        hours: '20 hrs',
        reason: 'Crucial for senior engineering screens to prevent database saturation under traffic spikes.',
        resources: [
          { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' },
        ],
      },
    ],
  },
];

function normalizeSkill(skill) {
  return String(skill || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getStoredJobProfile() {
  try {
    return JSON.parse(localStorage.getItem('cm_jdProfile') || 'null');
  } catch {
    return null;
  }
}

export default function SkillRoadmap() {
  const [curriculum, setCurriculum] = useState(DEFAULT_CURRICULUM);
  const [jobProfile] = useState(getStoredJobProfile);
  const [gapData, setGapData] = useState(null);
  const [skillProgress, setSkillProgress] = useState({
    'TypeScript / Advanced JavaScript': 'In Progress',
    'PostgreSQL & Relational Indexing': 'In Progress',
    'Docker Containerization': 'Not Started',
    'CI/CD & Automated Testing': 'Not Started',
    'System Design & Redis Caching': 'Not Started',
  });

  // Calculate completion percentage
  const totalSkills = Object.keys(skillProgress).length || 5;
  const completedCount = Object.values(skillProgress).filter((s) => s === 'Demonstrated').length;
  const inProgressCount = Object.values(skillProgress).filter((s) => s === 'In Progress' || s === 'Practicing').length;
  const overallPercent = Math.round(((completedCount * 1.0 + inProgressCount * 0.4) / totalSkills) * 100);

  const requiredSkills = jobProfile?.requiredSkills || [];
  const preferredSkills = jobProfile?.preferredSkills || [];
  const storedMatch = (() => {
    try { return JSON.parse(localStorage.getItem('cm_matchResult') || 'null'); } catch { return null; }
  })();
  useEffect(() => {
    if (!storedMatch?.matchId) return;
    api.skillGap(storedMatch.matchId).then(setGapData).catch(() => setGapData(null));
  }, [storedMatch?.matchId]);

  const missingSkills = [...(storedMatch?.gaps || []), ...(storedMatch?.preferredGaps || [])];
  const suggestedCourses = curriculum
    .flatMap((phase) => phase.skills.map((course) => ({ ...course, phase: phase.phase })))
    .map((course) => {
      const courseText = normalizeSkill(course.skill);
      const required = requiredSkills.find((skill) => courseText.includes(normalizeSkill(skill)) || normalizeSkill(skill).includes(courseText));
      const preferred = preferredSkills.find((skill) => courseText.includes(normalizeSkill(skill)) || normalizeSkill(skill).includes(courseText));
      const missing = missingSkills.some((skill) => courseText.includes(normalizeSkill(skill)) || normalizeSkill(skill).includes(courseText));
      return { ...course, matchedRequirement: required || preferred, missing, priority: missing && required ? 0 : required ? 1 : preferred ? 2 : 3 };
    })
    .filter((course) => course.matchedRequirement || (!jobProfile && course.priority === 3))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 4);

  function handleStatusChange(skillName, newStatus) {
    setSkillProgress((prev) => ({ ...prev, [skillName]: newStatus }));
    api.updateRoadmapProgress(skillName, newStatus).catch(console.error);
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 980 }}>

        {/* Header */}
        <div className="flex justify-between items-center" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="inline-flex items-center gap-2 badge badge-neutral" style={{ marginBottom: '0.35rem' }}>
              <IconCompass size={13} />
              <span>Targeted Skill Remediation</span>
            </div>
            <h1>Skill Roadmap & Engineering Curriculum</h1>
            <p>A structured milestone plan to eliminate identified technical gaps before interviewing.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/interview" className="btn btn-primary btn-sm">
              <span>Test Knowledge in Mock Interview</span>
              <IconArrowRight size={14} />
            </Link>
          </div>
        </div>

        <SectionImage
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80"
          alt="A person studying technical material at a laptop"
          title="Skills Roadmap"
        />

        {/* Overview Progress Card */}
        <div className="pro-card" style={{ padding: '1.5rem 1.75rem', marginBottom: '2rem' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem' }}>Curriculum Progress Overview</h3>
              <p style={{ fontSize: '0.82rem' }}>
                {completedCount} of {totalSkills} skills demonstrated • {inProgressCount} in active practice
              </p>
            </div>
            <span className="badge badge-brand" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
              {overallPercent}% Complete
            </span>
          </div>
          <ProgressBar value={overallPercent} color="var(--brand-primary)" showPercent={false} height={8} />
        </div>

        {/* Evidence-aware priority actions */}
        {gapData?.improvementRoadmap?.length > 0 && (
          <div className="pro-card" style={{ marginBottom: '2rem' }}>
            <div className="pro-card-header">
              <div>
                <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                  <IconTarget size={16} style={{ color: 'var(--brand-primary)' }} />
                  <span className="badge badge-brand">PRIORITY GAPS</span>
                </div>
                <h3 style={{ fontSize: '1.18rem' }}>What to improve first</h3>
                <p style={{ fontSize: '0.84rem', marginTop: 3 }}>Actions are ranked by required/preferred status, resume evidence, and job responsibility impact.</p>
              </div>
            </div>
            <div className="pro-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {gapData.improvementRoadmap.map((item) => {
                const currentStatus = skillProgress[item.skill] || item.status || 'Not Started';
                return (
                  <article key={item.skill} style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '1.1rem' }}>
                    <div className="flex justify-between items-start" style={{ gap: '1rem', flexWrap: 'wrap' }}>
                      <div>
                        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                          <h4 style={{ fontSize: '1rem' }}>{item.skill}</h4>
                          <span className={`badge ${item.priority === 'Critical' ? 'badge-error' : item.priority === 'High' ? 'badge-warning' : 'badge-neutral'}`}>{item.priority}</span>
                          <span className="badge badge-neutral">{item.requirementType}</span>
                        </div>
                        <p style={{ fontSize: '0.83rem', marginTop: 5 }}>{item.whyItMatters}</p>
                      </div>
                      <select
                        className="form-select"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', width: 'auto' }}
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(item.skill, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div className="grid-2" style={{ gap: '0.75rem', marginTop: '0.75rem' }}>
                      <div><strong style={{ fontSize: '0.76rem' }}>LEARN</strong><p style={{ fontSize: '0.8rem', marginTop: 3 }}>{item.learningTopics?.join(' • ')}</p></div>
                      <div><strong style={{ fontSize: '0.76rem' }}>PRACTICE</strong><p style={{ fontSize: '0.8rem', marginTop: 3 }}>{item.practiceTask}</p></div>
                      <div><strong style={{ fontSize: '0.76rem' }}>MINI-PROJECT</strong><p style={{ fontSize: '0.8rem', marginTop: 3 }}>{item.miniProject}</p></div>
                      <div><strong style={{ fontSize: '0.76rem' }}>INTERVIEW</strong><p style={{ fontSize: '0.8rem', marginTop: 3 }}>{item.interviewQuestion}</p></div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* Job-driven course recommendations */}
        <div className="pro-card course-recommendations" style={{ marginBottom: '2rem' }}>
          <div className="pro-card-header">
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                <IconTarget size={16} style={{ color: 'var(--brand-primary)' }} />
                <span className="badge badge-brand">JOB-DRIVEN</span>
              </div>
              <h3 style={{ fontSize: '1.18rem' }}>Suggested Courses for {jobProfile?.title || 'Your Target Role'}</h3>
              <p style={{ fontSize: '0.84rem', marginTop: 3 }}>
                {jobProfile
                  ? 'Prioritized from the required and preferred skills in your analyzed job description.'
                  : 'Analyze a job description to get recommendations matched to its required skills.'}
              </p>
            </div>
            <IconLayers size={24} style={{ color: 'var(--brand-primary)', opacity: 0.7 }} />
          </div>

          <div className="pro-card-body">
            <div className="course-grid">
              {suggestedCourses.map((course) => (
                <article className="course-card" key={course.skill}>
                  <div className="course-card-topline">
                    <span className={`course-priority ${course.priority === 0 ? 'course-priority-critical' : ''}`}>
                      {course.priority === 0 ? 'Required gap' : course.priority === 1 ? 'Required skill' : course.priority === 2 ? 'Preferred skill' : 'Recommended'}
                    </span>
                    <span className="course-hours"><IconClock size={13} /> {course.hours}</span>
                  </div>
                  <h4>{course.skill}</h4>
                  <p>{course.reason}</p>
                  {course.matchedRequirement && (
                    <div className="course-match">Matches: {course.matchedRequirement}</div>
                  )}
                  <div className="course-links">
                    {course.resources?.slice(0, 2).map((resource) => (
                      <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                        {resource.title} <IconExternalLink size={12} />
                      </a>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* Phased Roadmap Blocks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {curriculum.map((phase, pIdx) => (
            <div key={pIdx} className="pro-card">
              <div className="pro-card-header">
                <div>
                  <span className="badge badge-neutral" style={{ marginBottom: 4 }}>MILESTONE 0{pIdx + 1}</span>
                  <h3 style={{ fontSize: '1.18rem' }}>{phase.phase}</h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: 2 }}>{phase.desc}</p>
                </div>
              </div>

              <div className="pro-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {phase.skills.map((item, sIdx) => {
                  const currentStatus = skillProgress[item.skill] || 'Not Started';
                  return (
                    <div
                      key={sIdx}
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '1.25rem',
                      }}
                    >
                      <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 style={{ fontSize: '1.02rem' }}>{item.skill}</h4>
                            <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{item.difficulty}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>⏱ {item.hours}</span>
                          </div>
                          <p style={{ fontSize: '0.85rem', marginTop: 4, maxWidth: 640 }}>{item.reason}</p>
                        </div>

                        {/* Status Selector */}
                        <div className="flex items-center gap-2">
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status:</label>
                          <select
                            className="form-select"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', width: 'auto' }}
                            value={currentStatus}
                            onChange={(e) => handleStatusChange(item.skill, e.target.value)}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Documentation Resources */}
                      {item.resources && item.resources.length > 0 && (
                        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {item.resources.map((r, rIdx) => (
                            <a
                              key={rIdx}
                              href={r.url}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.76rem', padding: '0.2rem 0.6rem' }}
                            >
                              <span>{r.title}</span>
                              <IconExternalLink size={12} />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
