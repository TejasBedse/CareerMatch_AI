const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('cm_token') : null;
}

function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function parseApiError(res, data) {
  if (data && data.message) return data.message;
  if (res.status === 404) return 'API endpoint not found. Make sure the backend server is running on port 5000.';
  if (res.status === 401) return 'Your session has expired. Please log in again.';
  if (res.status === 500) return 'The server hit an internal error. Please try again.';
  return `Request failed: ${res.status}`;
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
  if (!res.ok) {
    if (res.status === 401) {
      clearAuth();
    }
    throw new Error(parseApiError(res, data));
  }
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
  uploadResumeFile: (file, candidateName, targetRole) => {
    const formData = new FormData();
    formData.append('resumeFile', file);
    if (candidateName) formData.append('candidateName', candidateName);
    if (targetRole) formData.append('targetRole', targetRole);

    const token = getToken();
    return fetch(`${API_BASE}/api/resumes/upload-file`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(parseApiError(res, data));
      return data;
    });
  },
  getResumes: () =>
    request('GET', '/api/resumes', null, true),
  resumeSuggestions: (resumeId, jdId) =>
    request('POST', '/api/resume-ai/suggestions', { resumeId, jdId }, true),

  // JD
  analyzeJd: (title, company, text) =>
    request('POST', '/api/jd/analyze', { title, company, text }, true),
  getJobs: () =>
    request('GET', '/api/jobs', null, true),

  // Match
  match: (resumeId, jdId) =>
    request('POST', '/api/match', { resumeId, jdId }, true),
  compareMatches: (resumeId, jdIds) =>
    request('POST', '/api/matches/compare', { resumeId, jdIds }, true),

  // Skill gap
  skillGap: (matchId) =>
    request('POST', '/api/skill-gap-analysis', { matchId }, true),

  // Roadmap progress
  updateProgress: (skill, status) =>
    request('PATCH', '/api/roadmap/progress', { skill, status }, true),
  updateRoadmapProgress: (skill, status) =>
    request('PATCH', '/api/roadmap/progress', { skill, status }, true),

  // Dashboard
  getDashboard: () =>
    request('GET', '/api/dashboard', null, true),
  getReadiness: () =>
    request('GET', '/api/readiness', null, true),

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
  const token = getToken();
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return true;

  const isExpired = Date.now() >= payload.exp * 1000;
  if (isExpired) {
    clearAuth();
    return false;
  }

  return true;
}
