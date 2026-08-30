const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getToken() {
  return localStorage.getItem('cm_token');
}

async function request(method, path, body = null, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
  return data;
}

export const api = {
  // Auth
  register: (name, email, password) =>
    request('POST', '/api/auth/register', { name, email, password }),
  login: (email, password) =>
    request('POST', '/api/auth/login', { email, password }),

  // Resume
  uploadResume: (resumeText, candidateName, targetRole) =>
    request('POST', '/api/resumes/upload', { resumeText, candidateName, targetRole }, true),
  getResumes: () =>
    request('GET', '/api/resumes', null, true),

  // JD
  analyzeJd: (title, company, text) =>
    request('POST', '/api/jd/analyze', { title, company, text }, true),

  // Match
  match: (resumeId, jdId) =>
    request('POST', '/api/match', { resumeId, jdId }, true),

  // Skill gap
  skillGap: (matchId) =>
    request('POST', '/api/skill-gap-analysis', { matchId }, true),

  // Roadmap progress
  updateProgress: (skill, status) =>
    request('PATCH', '/api/roadmap/progress', { skill, status }, true),

  // Dashboard
  getDashboard: () =>
    request('GET', '/api/dashboard', null, true),

  // Interview
  startInterview: (matchId) =>
    request('POST', '/api/interview/start', { matchId }, true),
  answerInterview: (sessionId, questionId, answer) =>
    request('POST', '/api/interview/answer', { sessionId, questionId, answer }, true),

  // Applications
  getApplications: () =>
    request('GET', '/api/applications', null, true),
  addApplication: (data) =>
    request('POST', '/api/applications', data, true),
  updateApplication: (id, status) =>
    request('PATCH', `/api/applications/${id}`, { status }, true),
};

export function saveAuth(token, user) {
  localStorage.setItem('cm_token', token);
  localStorage.setItem('cm_user', JSON.stringify(user));
}
export function clearAuth() {
  localStorage.removeItem('cm_token');
  localStorage.removeItem('cm_user');
}
export function getUser() {
  try { return JSON.parse(localStorage.getItem('cm_user')); } catch { return null; }
}
export function isAuthenticated() {
  return !!getToken();
}
