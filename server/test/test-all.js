const test = require('node:test');
const assert = require('node:assert/strict');

const { createApp } = require('../index.js');
const { EAMS_WEIGHTS, calculateMatchScore } = require('../services/matchingService');
const { EVIDENCE_LEVELS, analyzeSkillEvidence } = require('../services/evidenceService');
const { buildGapRoadmap } = require('../services/roadmapService');
const { buildResumeSuggestions } = require('../services/resumeService');
const { buildInterviewQuestions, evaluateInterviewAnswer, selectAdaptiveQuestion } = require('../services/interviewService');
const { calculateCareerReadiness } = require('../services/readinessService');
const { compareJobs } = require('../services/comparisonService');
const { getProviderStatus } = require('../services/aiService');

async function withServer(app, callback) {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  try {
    return await callback(port);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

async function callApi(app, method, path, body, token) {
  return withServer(app, async (port) => {
    const response = await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return response;
  });
}

test('health endpoint is available', async () => {
  const app = createApp();
  const response = await callApi(app, 'GET', '/health');

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.status, 'ok');
});

test('Vercel-hosted demo registration and login requests pass CORS', async () => {
  const app = createApp();
  const origin = 'https://careermatch-preview.vercel.app';

  await withServer(app, async (port) => {
    const registerResponse = await fetch(`http://127.0.0.1:${port}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: origin },
      body: JSON.stringify({
        name: 'Alex Morgan',
        email: 'demo@careermatch.ai',
        password: 'demo123456',
      }),
    });

    assert.equal(registerResponse.status, 201);
    assert.equal(registerResponse.headers.get('access-control-allow-origin'), origin);

    const loginResponse = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: origin },
      body: JSON.stringify({ email: 'demo@careermatch.ai', password: 'demo123456' }),
    });

    assert.equal(loginResponse.status, 200);
    assert.equal(loginResponse.headers.get('access-control-allow-origin'), origin);
  });
});

test('EAMS calculates the reference evidence-aware score', () => {
  const result = calculateMatchScore({
    skills: ['python', 'sql', 'machine learning', 'power bi'],
    summary: 'Built a machine learning prediction project with Python and Power BI.',
    experience: '1 year hands-on experience using SQL.',
  }, {
    title: 'Data Scientist',
    text: 'Python SQL Machine Learning AWS Power BI data science responsibilities',
    requiredSkills: ['Python', 'SQL', 'Machine Learning'],
    preferredSkills: ['AWS', 'Power BI'],
    responsibilities: ['Build prediction models and deploy analytical solutions'],
  });

  assert.deepEqual(EAMS_WEIGHTS, {
    skillMatch: 0.30,
    semanticMatch: 0.30,
    experience: 0.15,
    projectEvidence: 0.15,
    requirementImportance: 0.10,
  });
  assert.deepEqual(result.factorScores, {
    skillMatch: 85,
    semanticMatch: 90,
    experience: 70,
    projectEvidence: 80,
    requirementImportance: 90,
  });
  assert.deepEqual(result.contributions, {
    skillMatch: 25.5,
    semanticMatch: 27,
    experience: 10.5,
    projectEvidence: 12,
    requirementImportance: 9,
  });
  assert.equal(result.overallScore, 84);
  assert.deepEqual(result.preferredGaps, ['aws']);
});

test('evidence analysis classifies skill strength and source', () => {
  const evidence = analyzeSkillEvidence(
    ['Python', 'SQL', 'AWS', 'Power BI'],
    `Skills: Python, SQL, Power BI\nMachine Learning Project: Used Python with Pandas and NumPy.\nExperience: 1 year hands-on experience using SQL.\nPower BI basic project mention.`,
  );

  assert.equal(evidence.find((item) => item.skill === 'Python').evidenceLevel, EVIDENCE_LEVELS.MODERATE);
  assert.equal(evidence.find((item) => item.skill === 'Python').evidenceSource, 'Project');
  assert.equal(evidence.find((item) => item.skill === 'SQL').evidenceLevel, EVIDENCE_LEVELS.MODERATE);
  assert.equal(evidence.find((item) => item.skill === 'AWS').evidenceLevel, EVIDENCE_LEVELS.MISSING);
  assert.equal(evidence.find((item) => item.skill === 'Power BI').evidenceLevel, EVIDENCE_LEVELS.WEAK);
});

test('roadmap prioritizes required and responsibility-related gaps', () => {
  const roadmap = buildGapRoadmap({
    requiredGaps: ['AWS', 'Docker'],
    preferredGaps: ['Power BI'],
    responsibilities: ['Containerize services with Docker'],
    skillEvidence: [
      { skill: 'AWS', evidenceLevel: 'MISSING', evidenceText: 'No evidence found.' },
      { skill: 'Docker', evidenceLevel: 'MISSING', evidenceText: 'No evidence found.' },
    ],
  });

  assert.deepEqual(roadmap.map((item) => [item.skill, item.priority]), [
    ['AWS', 'Critical'],
    ['Docker', 'High'],
    ['Power BI', 'Low'],
  ]);
  assert.equal(roadmap[0].requirementType, 'REQUIRED');
  assert.ok(roadmap[0].practiceTask);
  assert.ok(roadmap[0].miniProject);
  assert.ok(roadmap[0].interviewQuestion);
});

test('resume suggestions preserve the truth guard', () => {
  const result = buildResumeSuggestions({
    skills: ['python', 'sql'],
    skillEvidence: [{ skill: 'python', evidenceLevel: 'STRONG' }],
  }, {
    requiredSkills: ['Python', 'SQL', 'Machine Learning'],
    preferredSkills: ['AWS'],
  });

  const missing = result.suggestions.filter((item) => item.skill === 'Machine Learning' || item.skill === 'AWS');
  assert.equal(result.summary.requiredCovered, 2);
  assert.equal(result.summary.requiredTotal, 3);
  assert.equal(missing.length, 2);
  assert.ok(missing.every((item) => item.label === 'SUGGESTED - VERIFY BEFORE USING'));
  assert.match(result.truthGuard, /never create unsupported/i);
});

test('interview service creates role-specific questions and adapts to weak areas', () => {
  const questions = buildInterviewQuestions({
    strengths: ['Python'],
    gaps: ['AWS'],
    skillEvidence: [{ skill: 'Python', evidenceLevel: 'STRONG' }],
    targetRole: 'Data Scientist',
  });
  const evaluation = evaluateInterviewAnswer('I used Python to build a model for a project.', questions[0]);
  const nextQuestion = selectAdaptiveQuestion(questions, [questions[0].id], evaluation.weakestArea);

  assert.ok(questions.some((question) => question.question.includes('Python')));
  assert.ok(questions.some((question) => question.question.includes('AWS')));
  assert.ok(evaluation.dimensions.relevance);
  assert.ok(evaluation.weakestArea);
  assert.ok(nextQuestion);
  assert.notEqual(nextQuestion.id, questions[0].id);
});

test('readiness separates job match, career readiness, and interview readiness', () => {
  const readiness = calculateCareerReadiness({
    resume: { parsedProfile: { skills: ['python'], skillEvidence: [{ confidence: 0.9 }] } },
    match: {
      overallScore: 84,
      gaps: ['aws'],
      factorScores: { requirementImportance: 90, projectEvidence: 80, experience: 70 },
    },
    interviewSessions: [{ scores: [70, 80] }],
    roadmapItems: [{ status: 'Demonstrated' }, { status: 'Learning' }],
  });

  assert.equal(readiness.jobMatch, 84);
  assert.equal(readiness.interviewReadiness, 75);
  assert.ok(readiness.careerReadiness > 0);
  assert.equal(readiness.applicationReadiness.decision, 'APPLY AFTER IMPROVEMENT');
  assert.ok(readiness.applicationReadiness.reasons.some((reason) => /aws/i.test(reason)));
});

test('multi-job comparison sorts roles by explainable match score', () => {
  const comparisons = compareJobs({
    resume: { parsedProfile: { skills: ['python'] } },
    jobs: [
      { jdId: 'job-low', title: 'ML Engineer', company: 'A', requiredSkills: ['python', 'aws'], preferredSkills: [] },
      { jdId: 'job-high', title: 'Python Analyst', company: 'B', requiredSkills: ['python'], preferredSkills: [] },
    ],
    calculateMatch: (resume, job) => ({
      overallScore: job.jdId === 'job-high' ? 90 : 50,
      strengths: ['python'],
      gaps: job.jdId === 'job-high' ? [] : ['aws'],
      preferredGaps: [],
      factorScores: { skillMatch: 80 },
    }),
  });

  assert.deepEqual(comparisons.map((item) => item.jdId), ['job-high', 'job-low']);
  assert.equal(comparisons[1].topGap, 'aws');
});

test('match resources cannot be accessed across users', async () => {
  const app = createApp();
  const first = await callApi(app, 'POST', '/api/auth/register', {
    name: 'Owner One', email: 'owner-one@example.com', password: 'StrongPass123!'
  });
  const firstToken = (await first.json()).token;
  const resumeResponse = await callApi(app, 'POST', '/api/resumes/upload', {
    resumeText: 'Python and SQL experience', targetRole: 'Data Analyst'
  }, firstToken);
  const resumeId = (await resumeResponse.json()).resumeId;
  const jdResponse = await callApi(app, 'POST', '/api/jd/analyze', {
    title: 'Data Analyst', text: 'Required: Python and SQL'
  }, firstToken);
  const jdId = (await jdResponse.json()).jdId;

  const second = await callApi(app, 'POST', '/api/auth/register', {
    name: 'Owner Two', email: 'owner-two@example.com', password: 'StrongPass123!'
  });
  const secondToken = (await second.json()).token;
  const response = await callApi(app, 'POST', '/api/match', { resumeId, jdId }, secondToken);

  assert.equal(response.status, 404);
});

test('AI provider status always exposes deterministic fallback information', () => {
  const status = getProviderStatus();
  assert.ok(status.provider);
  assert.equal(status.fallback, 'deterministic rule-based analysis');
  assert.equal(typeof status.configured, 'boolean');
});

test('register and login flows work', async () => {
  const app = createApp();

  const registerResponse = await callApi(app, 'POST', '/api/auth/register', {
    name: 'Aisha Khan',
    email: 'aisha@example.com',
    password: 'StrongPass123!'
  });

  assert.equal(registerResponse.status, 201);
  const registerPayload = await registerResponse.json();
  assert.ok(registerPayload.token);
  assert.equal(registerPayload.user.email, 'aisha@example.com');

  const loginResponse = await callApi(app, 'POST', '/api/auth/login', {
    email: 'aisha@example.com',
    password: 'StrongPass123!'
  });

  assert.equal(loginResponse.status, 200);
  const loginPayload = await loginResponse.json();
  assert.ok(loginPayload.token);
  assert.equal(loginPayload.user.name, 'Aisha Khan');
});

test('resume upload and matching evaluation return structured results', async () => {
  const app = createApp();

  const registerResponse = await callApi(app, 'POST', '/api/auth/register', {
    name: 'Jamie Lee',
    email: 'jamie@example.com',
    password: 'StrongPass123!'
  });
  const token = (await registerResponse.json()).token;

  const uploadResult = await callApi(app, 'POST', '/api/resumes/upload', {
    candidateName: 'Jamie Lee',
    resumeText: `
      Data Analyst with Python, SQL, Tableau, and Excel.
      Built dashboards and KPI reporting with Pandas and Power BI.
      Worked on ETL pipelines and A/B testing.
      Education: B.Sc. in Statistics.
    `,
    targetRole: 'Data Analyst'
  }, token);

  assert.equal(uploadResult.status, 201);
  const uploadPayload = await uploadResult.json();
  assert.ok(uploadPayload.resumeId);
  assert.ok(uploadPayload.parsedProfile.skills.includes('python'));

  const jdResult = await callApi(app, 'POST', '/api/jd/analyze', {
    title: 'Data Analyst',
    company: 'Nova Analytics',
    text: 'We are looking for a Data Analyst with SQL, Python, Tableau, statistics, business intelligence, and dashboarding. Required: SQL, Python, Tableau, statistics. Preferred: Power BI, ETL, data storytelling.'
  }, token);

  assert.equal(jdResult.status, 200);
  const jdPayload = await jdResult.json();
  assert.ok(jdPayload.requiredSkills.includes('sql'));

  const matchResult = await callApi(app, 'POST', '/api/match', {
    resumeId: uploadPayload.resumeId,
    jdId: jdPayload.jdId
  }, token);

  assert.equal(matchResult.status, 200);
  const matchPayload = await matchResult.json();
  assert.ok(matchPayload.overallScore >= 0);
  assert.ok(Array.isArray(matchPayload.strengths));
  assert.ok(Array.isArray(matchPayload.gaps));
  assert.ok(Array.isArray(matchPayload.recommendations));
});

test('resume file upload accepts uploaded documents and extracts text', async () => {
  const app = createApp();

  const registerResponse = await callApi(app, 'POST', '/api/auth/register', {
    name: 'Taylor Kim',
    email: 'taylor@example.com',
    password: 'StrongPass123!'
  });
  const token = (await registerResponse.json()).token;

  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  try {
    const formData = new FormData();
    formData.append('candidateName', 'Taylor Kim');
    formData.append('targetRole', 'Software Engineer');
    formData.append('resumeFile', new Blob(['Software Engineer with Python, JavaScript, React, and SQL experience.'], { type: 'text/plain' }), 'resume.txt');

    const uploadResponse = await fetch(`http://127.0.0.1:${port}/api/resumes/upload-file`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    assert.equal(uploadResponse.status, 201);
    const payload = await uploadResponse.json();
    assert.ok(payload.resumeId);
    assert.ok(payload.parsedProfile.skills.includes('python'));
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test('resume upload requires a target role while using the logged-in candidate name automatically', async () => {
  const app = createApp();

  const registerResponse = await callApi(app, 'POST', '/api/auth/register', {
    name: 'Morgan Bell',
    email: 'morgan@example.com',
    password: 'StrongPass123!'
  });
  const token = (await registerResponse.json()).token;

  const missingNameResponse = await callApi(app, 'POST', '/api/resumes/upload', {
    resumeText: 'Python, JavaScript, SQL experience',
    targetRole: 'Frontend Engineer'
  }, token);

  assert.equal(missingNameResponse.status, 201);
  const missingNamePayload = await missingNameResponse.json();
  assert.equal(missingNamePayload.candidateName, 'Morgan Bell');

  const missingRoleResponse = await callApi(app, 'POST', '/api/resumes/upload', {
    resumeText: 'Python, JavaScript, SQL experience',
    candidateName: 'Morgan Bell'
  }, token);

  assert.equal(missingRoleResponse.status, 400);
  const missingRolePayload = await missingRoleResponse.json();
  assert.match(missingRolePayload.message, /target role/i);
});

test('resume upload falls back to the authenticated user name when candidate name is missing', async () => {
  const app = createApp();

  const registerResponse = await callApi(app, 'POST', '/api/auth/register', {
    name: 'Noah Patel',
    email: 'noah@example.com',
    password: 'StrongPass123!'
  });
  const token = (await registerResponse.json()).token;

  const uploadResponse = await callApi(app, 'POST', '/api/resumes/upload', {
    resumeText: 'Python, JavaScript, SQL, React experience with analytics dashboards.',
    targetRole: 'Product Engineer'
  }, token);

  assert.equal(uploadResponse.status, 201);
  const payload = await uploadResponse.json();
  assert.equal(payload.candidateName, 'Noah Patel');
  assert.equal(payload.targetRole, 'Product Engineer');
});
