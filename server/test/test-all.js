const test = require('node:test');
const assert = require('node:assert/strict');

const { createApp } = require('../index.js');

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
