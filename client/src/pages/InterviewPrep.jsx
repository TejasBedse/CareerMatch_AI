import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import SectionImage from '../components/SectionImage';
import {
  IconMic,
  IconSparkles,
  IconCheck,
  IconAlertCircle,
  IconCheckCircle,
  IconSend,
  IconHelpCircle,
  IconEye
} from '../components/Icons';

const CATEGORIES = ['All', 'Technical', 'Behavioral', 'System Architecture', 'Resume Verification', 'Project-based', 'JD-based', 'Skill-gap based'];

const QUESTIONS = [
  {
    id: 'q1',
    category: 'Behavioral',
    question: 'Describe a challenging engineering project you delivered under tight constraints. How did you manage technical debt and trade-offs?',
    hint: 'Structure your response using the STAR method: Situation, Task, Action, and quantifiable Result.',
    modelAnswer: 'In our previous quarter, we had 3 weeks to launch a multi-tenant webhook processing service. I designed a lightweight Redis worker queue rather than a full Kafka cluster to meet the deadline while isolating the database from spike loads. We delivered on time with zero downtime, handling 2.5M daily events, and later migrated to durable streams once requirements stabilized.',
  },
  {
    id: 'q2',
    category: 'Technical',
    question: 'How do you detect and prevent database connection pool exhaustion in a high-throughput Node.js microservice?',
    hint: 'Mention connection pooling configuration, timeouts, async/await error handling, and release guarantees.',
    modelAnswer: 'I configure pool limits with max connections sized to database instance capacity, set acquireTimeoutMillis to prevent indefinite blocking, and always ensure clients are wrapped in try/finally blocks or managed by ORM connection contexts. Additionally, we use read replicas for query-heavy paths and caching for hot keys.',
  },
  {
    id: 'q3',
    category: 'System Architecture',
    question: 'Walk me through how you would architect an idempotent payment processing API to prevent duplicate charges during network failures.',
    hint: 'Discuss idempotency keys, atomic database transactions, distributed locks, and response caching.',
    modelAnswer: 'Clients pass a unique Idempotency-Key header with every charge request. The API uses an atomic insert or Redis lock on this key with an in-progress status. If a duplicate request arrives while processing, it waits or returns 409. Once complete, the response payload is cached against the key for 24 hours so identical retries receive the original result without re-charging.',
  },
  {
    id: 'q4',
    category: 'Resume Verification',
    question: 'You highlighted experience optimizing database queries. What specific techniques and profiling tools did you employ, and what were the measured improvements?',
    hint: 'Mention EXPLAIN ANALYZE, query index strategies, N+1 problem resolution, and percentage latency drops.',
    modelAnswer: 'I used PostgreSQL EXPLAIN ANALYZE to identify sequential table scans on our primary orders table. By introducing composite B-tree indexes on customer_id and created_at, and resolving N+1 queries using batch loading, we reduced 99th-percentile API response latency from 420ms down to 68ms under peak production load.',
  },
];

function evaluateAnswer(answer) {
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const hasNumbers = /\d+/.test(answer);
  const hasActionVerbs = /\b(built|created|developed|implemented|designed|architected|reduced|optimized|improved|scaled|delivered)\b/i.test(answer);
  const hasOutcome = /\b(result|outcome|decreased|increased|latency|uptime|percent|saved|reduced)\b/i.test(answer);

  let score = 35;
  const breakdown = [];

  if (wordCount >= 40) {
    score += 25;
    breakdown.push({ label: 'Depth & Context', detail: `${wordCount} words provided (sufficient technical depth)`, pass: true });
  } else {
    breakdown.push({ label: 'Depth & Context', detail: 'Too brief — aim for 40+ words with specific implementation details', pass: false });
  }

  if (hasNumbers) {
    score += 20;
    breakdown.push({ label: 'Quantifiable Metrics', detail: 'Contains measurable numbers, benchmarks, or statistics', pass: true });
  } else {
    breakdown.push({ label: 'Quantifiable Metrics', detail: 'Missing quantifiable metrics (e.g. % improvement, latency ms, scale)', pass: false });
  }

  if (hasActionVerbs) {
    score += 10;
    breakdown.push({ label: 'Action-Oriented Verbs', detail: 'Strong active engineering verbs (architected, optimized, implemented)', pass: true });
  } else {
    breakdown.push({ label: 'Action-Oriented Verbs', detail: 'Use stronger active verbs to demonstrate personal ownership', pass: false });
  }

  if (hasOutcome) {
    score += 10;
    breakdown.push({ label: 'STAR Result & Outcome', detail: 'Direct connection made to business outcome or technical result', pass: true });
  } else {
    breakdown.push({ label: 'STAR Result & Outcome', detail: 'Conclude your answer with concrete results or business impact', pass: false });
  }

  return {
    score: Math.min(100, score),
    breakdown,
    wordCount,
  };
}

export default function InterviewPrep() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeQuestion, setActiveQuestion] = useState(QUESTIONS[0]);
  const [answer, setAnswer] = useState('');
  const [evalResult, setEvalResult] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(Boolean(SpeechRecognition));

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        setAnswer(transcript);
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    const storedMatch = localStorage.getItem('cm_matchResult');
    let matchId = null;
    try { matchId = JSON.parse(storedMatch || 'null')?.matchId; } catch { /* use fallback questions */ }

    if (matchId) {
      setSessionLoading(true);
      api.startInterview(matchId)
        .then((session) => {
          setSessionId(session.sessionId);
          setSessionQuestions(session.questions || []);
          if (session.questions?.[0]) setActiveQuestion(session.questions[0]);
        })
        .catch(() => setSessionError('AI session unavailable. Using the local interview coach.'))
        .finally(() => setSessionLoading(false));
    }

    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const availableQuestions = sessionQuestions.length > 0 ? sessionQuestions : QUESTIONS;

  const filteredQuestions = selectedCategory === 'All'
    ? availableQuestions
    : availableQuestions.filter((q) => q.category === selectedCategory);

  function handleSelectQuestion(q) {
    setActiveQuestion(q);
    setAnswer('');
    setEvalResult(null);
    setShowHint(false);
    setShowModelAnswer(false);
    stopListening();
  }

  function speakQuestion() {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeQuestion.question);
    utterance.rate = 0.94;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  function toggleListening() {
    if (!recognitionRef.current) return;
    if (isListening) {
      stopListening();
      return;
    }
    setAnswer('');
    recognitionRef.current.start();
    setIsListening(true);
  }

  async function toggleRecording() {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorder.onstop = () => stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setSessionError('Microphone access was blocked. You can still answer by text.');
    }
  }

  async function handleEvaluate(e) {
    e.preventDefault();
    if (!answer.trim()) return;
    if (sessionId) {
      try {
        const result = await api.answerInterview(sessionId, activeQuestion.id, answer);
        setEvalResult({
          score: result.score,
          breakdown: result.feedback || [],
          wordCount: result.wordCount,
          nextQuestion: result.nextQuestion,
          weakestArea: result.weakestArea,
          readinessScore: result.readinessScore,
        });
        return;
      } catch {
        setSessionError('AI scoring is temporarily unavailable. Showing local coaching instead.');
      }
    }
    setEvalResult(evaluateAnswer(answer));
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 1040 }}>

        {/* Header */}
        <div className="flex justify-between items-center" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="inline-flex items-center gap-2 badge badge-neutral" style={{ marginBottom: '0.35rem' }}>
              <IconMic size={13} />
              <span>AI Voice Interview Coach</span>
            </div>
            <h1>Practice with an AI interviewer</h1>
            <p>Speak naturally, get follow-up-ready feedback, and improve your interview answers before the real conversation.</p>
          </div>
          <div className="ai-interview-status"><span className="ai-status-pulse" /> {sessionLoading ? 'Preparing your interview...' : 'AI interviewer ready'}</div>
        </div>

        <SectionImage
          src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1600&q=80"
          alt="A professional preparing for an interview"
          title="Interview Practice"
        />

        <div className="ai-interview-shell">
          <div className="ai-interview-topbar">
            <div className="ai-interviewer-identity"><div className="ai-avatar"><IconSparkles size={20} /></div><div><strong>CareerMatch Interviewer</strong><small>Voice assistant • Role-calibrated</small></div></div>
            <div className="ai-interview-meta"><span>{availableQuestions.length} questions</span><span>English (US)</span></div>
          </div>

          {sessionError && <div className="alert alert-info" style={{ margin: '1rem 1.5rem 0' }}><IconAlertCircle size={16} /><span>{sessionError}</span></div>}

          <div className="ai-interview-body">
            <aside className="ai-question-rail">
              <div className="ai-rail-heading"><span>Interview plan</span><span>{availableQuestions.findIndex((q) => q.id === activeQuestion.id) + 1}/{availableQuestions.length}</span></div>
              {filteredQuestions.map((q, index) => (
                <button key={q.id} type="button" className={`ai-question-item ${activeQuestion.id === q.id ? 'active' : ''}`} onClick={() => handleSelectQuestion(q)}>
                  <span className="ai-question-number">{String(index + 1).padStart(2, '0')}</span><span><small>{q.category}</small>{q.question.length > 55 ? `${q.question.slice(0, 55)}...` : q.question}</span>
                </button>
              ))}
            </aside>

            <main className="ai-interview-room">
              <div className="ai-room-header"><span className="badge badge-brand">{activeQuestion.category}</span><span className="ai-room-timer"><span className="ai-status-pulse" /> Live practice</span></div>
              <div className="ai-speech-card">
                <div className={`ai-orb ${isSpeaking ? 'speaking' : ''}`}><IconSparkles size={32} /></div>
                <div className="ai-speech-copy"><span>AI interviewer asks</span><h2>{activeQuestion.question}</h2><button type="button" className="ai-listen-again" onClick={speakQuestion}>{isSpeaking ? 'Speaking...' : 'Listen to question'}</button></div>
              </div>

              <div className="ai-response-panel">
                <div className="ai-response-heading"><div><strong>Your response</strong><small>{isListening ? 'Listening... speak naturally' : voiceSupported ? 'Use your voice or type your answer' : 'Voice input is unavailable in this browser'}</small></div><span>{answer.trim().split(/\s+/).filter(Boolean).length} words</span></div>
                <textarea className="form-textarea ai-response-textarea" rows={5} placeholder="Your spoken answer will appear here..." value={answer} onChange={(e) => setAnswer(e.target.value)} />
                <div className="ai-voice-controls">
                  <button type="button" className={`ai-mic-button ${isListening ? 'active' : ''}`} onClick={toggleListening} disabled={!voiceSupported}><IconMic size={20} /><span>{isListening ? 'Stop listening' : 'Answer by voice'}</span></button>
                  <button type="button" className={`btn btn-secondary ${isRecording ? 'recording' : ''}`} onClick={toggleRecording}><span className="record-dot" />{isRecording ? 'Stop recording' : 'Record practice'}</button>
                  <button type="button" className="btn btn-primary" onClick={handleEvaluate} disabled={!answer.trim()}><IconSend size={15} /><span>Get AI feedback</span></button>
                </div>
              </div>

              <div className="ai-coaching-tools"><button type="button" onClick={() => setShowHint(!showHint)}><IconHelpCircle size={15} /> {showHint ? 'Hide coaching hint' : 'Show coaching hint'}</button><button type="button" onClick={() => setShowModelAnswer(!showModelAnswer)}><IconEye size={15} /> {showModelAnswer ? 'Hide model answer' : 'See a strong answer'}</button></div>
              {showHint && <div className="alert alert-info animate-fade-in"><strong>Coach tip:</strong> {activeQuestion.hint}</div>}
              {showModelAnswer && <div className="ai-model-answer animate-fade-in"><strong>Example of a strong response</strong><p>{activeQuestion.modelAnswer || 'Use a clear situation, explain the action you personally took, and finish with a measurable result.'}</p></div>}
              {evalResult && <div className="ai-feedback-card animate-fade-in"><div className="ai-feedback-score"><span>AI score</span><strong>{evalResult.score}</strong><small>/100</small></div><div><h3>Feedback on your answer</h3>{evalResult.breakdown.map((item, idx) => <div className="ai-feedback-line" key={idx}><IconCheck size={14} style={{ color: item.pass ? 'var(--matched)' : 'var(--gap)' }} /><span><strong>{item.label}:</strong> {item.detail}</span></div>)}{evalResult.weakestArea && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>Next practice focus: {evalResult.weakestArea}. Current session readiness: {evalResult.readinessScore}/100.</p>}{evalResult.nextQuestion && <button type="button" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }} onClick={() => handleSelectQuestion(evalResult.nextQuestion)}>Practice adaptive next question <IconSend size={13} /></button>}</div></div>}
            </main>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2" style={{ marginTop: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Legacy text console retained below for detailed rubric practice */}
        <div className="grid-2 legacy-interview-console" style={{ gridTemplateColumns: '1fr 1.6fr', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* Question List */}
          <div className="pro-card">
            <div className="pro-card-header">
              <h3 style={{ fontSize: '1.02rem' }}>Interview Question Bank</h3>
              <span className="badge badge-neutral">{filteredQuestions.length} Questions</span>
            </div>
            <div className="pro-card-body" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filteredQuestions.map((q) => {
                const isActive = activeQuestion.id === q.id;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleSelectQuestion(q)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isActive ? 'var(--brand-subtle)' : 'transparent',
                      border: isActive ? '1px solid var(--border-focus)' : '1px solid transparent',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all var(--transition)',
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>{q.category}</span>
                      {isActive && <span style={{ fontSize: '0.72rem', color: 'var(--brand-primary)', fontWeight: 600 }}>Active</span>}
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 500, lineHeight: 1.4 }}>
                      {q.question.length > 75 ? `${q.question.slice(0, 75)}…` : q.question}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Answer & Evaluation Console */}
          <div className="pro-card">
            <div className="pro-card-header">
              <div>
                <span className="badge badge-neutral" style={{ marginBottom: 4 }}>{activeQuestion.category}</span>
                <h3 style={{ fontSize: '1.1rem' }}>Scenario Question</h3>
              </div>
            </div>

            <div className="pro-card-body">
              <p style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.5, marginBottom: '1.25rem' }}>
                "{activeQuestion.question}"
              </p>

              {/* Collapsible Hint & Model Answer */}
              <div className="flex gap-2" style={{ marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.78rem' }}
                >
                  <IconHelpCircle size={13} />
                  <span>{showHint ? 'Hide STAR Hint' : 'Show STAR Hint'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowModelAnswer(!showModelAnswer)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.78rem' }}
                >
                  <IconEye size={13} />
                  <span>{showModelAnswer ? 'Hide Sample Model Answer' : 'Show Sample Model Answer'}</span>
                </button>
              </div>

              {showHint && (
                <div className="alert alert-info animate-fade-in" style={{ marginBottom: '1rem', fontSize: '0.84rem' }}>
                  <strong>STAR Coaching Hint:</strong> {activeQuestion.hint}
                </div>
              )}

              {showModelAnswer && (
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem 1rem',
                  fontSize: '0.86rem',
                  marginBottom: '1rem',
                  color: 'var(--text-secondary)',
                }}>
                  <strong style={{ color: 'var(--matched)', display: 'block', marginBottom: 4 }}>Benchmark Staff Engineer Answer:</strong>
                  {activeQuestion.modelAnswer}
                </div>
              )}

              {/* Form Input */}
              <form onSubmit={handleEvaluate}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <div className="flex justify-between items-center">
                    <label className="form-label" style={{ marginBottom: 0 }}>Your Technical Response</label>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      {answer.trim().split(/\s+/).filter(Boolean).length} Words
                    </span>
                  </div>
                  <textarea
                    className="form-textarea"
                    rows={6}
                    placeholder="Structure your answer clearly: outline the technical problem (Situation/Task), specific architecture or code you implemented (Action), and measured impact (Result)…"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button type="submit" className="btn btn-primary" disabled={!answer.trim()}>
                    <IconSend size={15} />
                    <span>Evaluate Response Rubric</span>
                  </button>
                </div>
              </form>

              {/* Evaluation Results Box */}
              {evalResult && (
                <div className="pro-card animate-fade-in" style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                  <div className="pro-card-header">
                    <div className="flex items-center gap-2">
                      <IconSparkles size={16} style={{ color: 'var(--brand-primary)' }} />
                      <h4 style={{ fontSize: '0.98rem' }}>STAR Rubric Evaluation</h4>
                    </div>
                    <span className="badge badge-brand" style={{ fontFamily: 'var(--font-mono)' }}>
                      Score: {evalResult.score}/100
                    </span>
                  </div>

                  <div className="pro-card-body" style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {evalResult.breakdown.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2" style={{ fontSize: '0.84rem' }}>
                          {item.pass ? (
                            <IconCheckCircle size={15} style={{ color: 'var(--matched)', marginTop: 2, flexShrink: 0 }} />
                          ) : (
                            <IconAlertCircle size={15} style={{ color: 'var(--gap)', marginTop: 2, flexShrink: 0 }} />
                          )}
                          <div>
                            <strong style={{ color: 'var(--text-primary)' }}>{item.label}:</strong>{' '}
                            <span style={{ color: 'var(--text-secondary)' }}>{item.detail}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
