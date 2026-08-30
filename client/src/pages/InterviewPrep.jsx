import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import ProgressBar from '../components/ProgressBar';

const CATEGORIES = ['Technical', 'HR', 'Behavioral', 'Resume-Specific'];

// Local question generator (used when backend returns none)
function generateLocalQuestions(matchResult) {
  const strengths = matchResult?.strengths || [];
  const gaps = matchResult?.gaps || [];

  const questions = [
    {
      id: 'q1', category: 'HR',
      question: 'Tell me about yourself and your background in data science.',
      hint: 'Mention your education, key projects, and what drives you in this field.',
    },
    {
      id: 'q2', category: 'Technical',
      question: strengths.length > 0
        ? `You listed ${strengths[0]} as a skill. Can you walk me through a project where you used it?`
        : 'Describe a technical project you are most proud of.',
      hint: 'Use the STAR method: Situation, Task, Action, Result.',
    },
    {
      id: 'q3', category: 'Technical',
      question: gaps.length > 0
        ? `This role requires ${gaps[0]}. How do you plan to close that gap?`
        : 'How do you stay current with developments in machine learning?',
      hint: 'Be honest about current level, and outline a specific learning plan.',
    },
    {
      id: 'q4', category: 'Behavioral',
      question: 'Describe a time you had to deliver results under a tight deadline.',
      hint: 'Focus on your prioritization strategy and the outcome.',
    },
    {
      id: 'q5', category: 'Technical',
      question: 'How would you explain a complex model\'s predictions to a non-technical stakeholder?',
      hint: 'Think about visualizations, analogies, and business impact framing.',
    },
    {
      id: 'q6', category: 'HR',
      question: 'Where do you see yourself in 3 years?',
      hint: 'Align your answer with the target role\'s growth trajectory.',
    },
    {
      id: 'q7', category: 'Behavioral',
      question: 'Tell me about a time you made a mistake and how you handled it.',
      hint: 'Show accountability and a growth mindset.',
    },
    {
      id: 'q8', category: 'Resume-Specific',
      question: `Walk me through your most technically challenging project.`,
      hint: 'Highlight the problem, your approach, tools used, and measurable outcomes.',
    },
  ];
  return questions;
}

function evaluateAnswer(answer, question) {
  const wordCount = answer.trim().split(/\s+/).length;
  const hasNumbers = /\d+/.test(answer);
  const hasAction = /\b(built|created|developed|implemented|designed|improved|achieved|reduced|increased)\b/i.test(answer);
  const isLong = wordCount >= 50;

  let score = 40;
  let feedback = [];

  if (isLong) { score += 20; } else { feedback.push('Your answer is quite short — aim for 50+ words.'); }
  if (hasNumbers) { score += 15; feedback.push('Good — you used specific numbers/metrics.'); }
  if (hasAction) { score += 15; feedback.push('Strong action verbs detected.'); }
  if (answer.toLowerCase().includes('result') || answer.toLowerCase().includes('outcome')) {
    score += 10; feedback.push('You mentioned results — excellent!');
  }
  if (feedback.length === 0) feedback.push('Try to add specific examples and measurable outcomes.');

  const level = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Work';
  return { score: Math.min(100, score), level, feedback };
}

export default function InterviewPrep() {
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [stage, setStage] = useState('intro'); // intro | question | result | summary
  const [filter, setFilter] = useState('All');
  const [sessionScores, setSessionScores] = useState([]);
  const [matchResult, setMatchResult] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('cm_matchResult');
    if (stored) {
      const mr = JSON.parse(stored);
      setMatchResult(mr);
      setQuestions(generateLocalQuestions(mr));
    } else {
      setQuestions(generateLocalQuestions(null));
    }
  }, []);

  const filteredQs = filter === 'All' ? questions : questions.filter(q => q.category === filter);

  function startSession() {
    setCurrentQ(0);
    setCurrentAnswer('');
    setEvaluation(null);
    setStage('question');
  }

  function submitAnswer() {
    if (!currentAnswer.trim()) return;
    const q = filteredQs[currentQ];
    const eval_ = evaluateAnswer(currentAnswer, q);
    setAnswers(prev => ({ ...prev, [q.id]: currentAnswer }));
    setSessionScores(prev => [...prev, eval_.score]);
    setEvaluation(eval_);
    setStage('result');
  }

  function nextQuestion() {
    if (currentQ < filteredQs.length - 1) {
      setCurrentQ(c => c + 1);
      setCurrentAnswer('');
      setEvaluation(null);
      setStage('question');
    } else {
      setStage('summary');
    }
  }

  const avgScore = sessionScores.length > 0 ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length) : 0;

  if (stage === 'intro') {
    return (
      <div className="page-wrapper">
        <div className="container-sm" style={{ padding: 'var(--space-8) var(--space-6)' }}>
          <div className="animate-fade-in-up">
            <h1 style={{ marginBottom: 'var(--space-2)' }}>Adaptive Mock Interview</h1>
            <p style={{ marginBottom: 'var(--space-8)' }}>
              Practice with {questions.length} personalized questions generated from your resume and target job.
              Each answer is evaluated and scored in real time.
            </p>

            {/* Category Filter */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div className="form-label" style={{ marginBottom: 'var(--space-3)' }}>Filter by Category</div>
              <div className="tabs">
                {['All', ...CATEGORIES].map(cat => (
                  <button key={cat} className={`tab-btn ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
              {filteredQs.map((q, i) => (
                <div key={q.id} className="glass-card" style={{ padding: 'var(--space-4)' }}>
                  <div className="flex items-center gap-3">
                    <span style={{ fontWeight: 800, color: 'var(--accent-purple)', minWidth: 24 }}>Q{i + 1}</span>
                    <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{q.category}</span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{q.question}</span>
                  </div>
                </div>
              ))}
            </div>

            <button id="start-interview-btn" className="btn btn-primary btn-lg" onClick={startSession} disabled={filteredQs.length === 0}>
              🎙️ Start Interview Session →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'summary') {
    return (
      <div className="page-wrapper">
        <div className="container-sm" style={{ padding: 'var(--space-8) var(--space-6)' }}>
          <div className="animate-fade-in-up text-center">
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>
              {avgScore >= 70 ? '🎉' : avgScore >= 50 ? '💪' : '📚'}
            </div>
            <h2 style={{ marginBottom: 'var(--space-2)' }}>Session Complete!</h2>
            <p style={{ marginBottom: 'var(--space-8)' }}>You answered {sessionScores.length} questions.</p>

            <div className="glass-card-static" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-6)' }}>
              <div style={{ fontSize: '4rem', fontWeight: 900, background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 }}>
                {avgScore}
              </div>
              <div style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>Average Interview Score</div>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <ProgressBar value={avgScore} showPercent={false} height={12} />
              </div>
            </div>

            <div className="grid-3" style={{ marginBottom: 'var(--space-8)' }}>
              {sessionScores.map((s, i) => (
                <div key={i} className="glass-card-static" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, color: s >= 70 ? 'var(--success)' : s >= 50 ? 'var(--warning)' : 'var(--error)' }}>{s}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Q{i + 1}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 justify-center" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => { setSessionScores([]); setAnswers({}); startSession(); }}>
                🔄 Practice Again
              </button>
              <Link to="/roadmap" className="btn btn-secondary">View Roadmap →</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const q = filteredQs[currentQ];

  return (
    <div className="page-wrapper">
      <div className="container-sm" style={{ padding: 'var(--space-8) var(--space-6)' }}>
        {/* Progress */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Question {currentQ + 1} of {filteredQs.length}
            </span>
            <span className="badge badge-purple">{q.category}</span>
          </div>
          <ProgressBar value={((currentQ + (stage === 'result' ? 1 : 0)) / filteredQs.length) * 100} showPercent={false} height={6} />
        </div>

        {/* Question */}
        <div className="interview-bubble interview-bubble-ai" style={{ marginBottom: 'var(--space-5)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
            🤖 Interviewer
          </div>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 500 }}>{q.question}</p>
          {q.hint && stage === 'question' && (
            <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'rgba(110,86,255,0.08)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              💡 Hint: {q.hint}
            </div>
          )}
        </div>

        {/* Answer or Evaluation */}
        {stage === 'question' && (
          <div className="animate-fade-in">
            <textarea
              id="interview-answer"
              className="form-input"
              placeholder="Type your answer here… Be specific, use examples, and mention results where possible."
              value={currentAnswer}
              onChange={e => setCurrentAnswer(e.target.value)}
              style={{ minHeight: 180, marginBottom: 'var(--space-4)' }}
            />
            <div className="flex justify-between items-center">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {currentAnswer.trim().split(/\s+/).filter(Boolean).length} words
              </span>
              <button id="submit-answer-btn" className="btn btn-primary" onClick={submitAnswer} disabled={!currentAnswer.trim()}>
                Submit Answer →
              </button>
            </div>
          </div>
        )}

        {stage === 'result' && evaluation && (
          <div className="animate-fade-in">
            {/* User's answer */}
            <div className="interview-bubble interview-bubble-user" style={{ marginBottom: 'var(--space-5)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
                👤 Your Answer
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{answers[q.id]}</p>
            </div>

            {/* Evaluation */}
            <div className="glass-card-static" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-5)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-4)' }}>
                <h3>AI Evaluation</h3>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: evaluation.score >= 70 ? 'var(--success)' : evaluation.score >= 50 ? 'var(--warning)' : 'var(--error)' }}>
                  {evaluation.score}/100
                </div>
              </div>
              <ProgressBar value={evaluation.score} showPercent={false} height={8} />
              <div style={{ marginTop: 'var(--space-2)', marginBottom: 'var(--space-4)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Level: <strong style={{ color: 'var(--text-primary)' }}>{evaluation.level}</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {evaluation.feedback.map((f, i) => (
                  <div key={i} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', padding: 'var(--space-2) var(--space-3)', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                    • {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button className="btn btn-secondary" onClick={() => { setCurrentAnswer(''); setEvaluation(null); setStage('question'); }}>
                ← Revise Answer
              </button>
              <button id="next-question-btn" className="btn btn-primary" onClick={nextQuestion}>
                {currentQ < filteredQs.length - 1 ? 'Next Question →' : 'Finish Session →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
