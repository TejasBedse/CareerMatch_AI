# CareerMatch AI

CareerMatch AI is a full-stack career intelligence platform built from the project specification in [CareerMatch_AI_spec.md](CareerMatch_AI_spec.md). It compares resume evidence with job requirements using an explainable EAMS score and connects gaps to roadmap actions, interview practice, readiness, and job comparison.

## Project status

- Backend API: implemented
- Authentication: implemented with JWT
- Resume upload and parsing: implemented
- JD analysis: implemented
- EAMS match engine: implemented
- Evidence-aware skill analysis: implemented
- Explainable match and evidence map: implemented
- Prioritized roadmap actions: implemented
- Truth-guarded resume suggestions: implemented
- Adaptive interview practice: implemented
- Career/application readiness: implemented
- Multi-job comparison: implemented
- Frontend UI: implemented with Vite/React
- Test coverage: included for core flows and security ownership checks

## Tech stack

- Node.js
- Express.js
- JWT authentication
- bcryptjs for password hashing
- CORS, Helmet, Compression, Morgan
- UUID

## Prerequisites

Before running locally, make sure you have:

- Node.js 18+ installed
- npm 9+ installed
- Git installed
- A terminal such as PowerShell, Command Prompt, or VS Code terminal

## Project structure

- [CareerMatch_AI_spec.md](CareerMatch_AI_spec.md) — complete project specification and source of truth
- [server/package.json](server/package.json) — backend package configuration
- [server/index.js](server/index.js) — Express server and API implementation
- [server/services](server/services) — scoring, evidence, roadmap, resume, interview, readiness, and comparison services
- [server/test/test-all.js](server/test/test-all.js) — verification tests for authentication and job-match flow
- [client/src](client/src) — Vite/React application and existing UI pages

## Local setup

1. Open a terminal in the project root.
2. Change into the server folder:

   ```bash
   cd server
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a local environment file if needed:

   ```bash
   copy NUL .env
   ```

   Then add the following values:

   ```env
   PORT=5000
   JWT_SECRET=careermatch-dev-secret
   ```

   If you are using PowerShell, you can also create the file with:

   ```powershell
   "PORT=5000
   JWT_SECRET=careermatch-dev-secret" | Set-Content .env
   ```

## Run the project locally

Start the backend from `server`, then start the frontend from `client` in a second terminal:

```powershell
cd server
npm.cmd start
```

```powershell
cd client
npm.cmd run dev
```

Open `http://localhost:5173`.

### Option 1: Start the app with the project script

```bash
npm start
```

This starts the API on:

- http://localhost:5000

### Option 2: Start directly with Node

```bash
node index.js
```

### Windows PowerShell note

If PowerShell blocks script execution, run the app using the direct Node command instead of npm scripts:

```powershell
cd server
node index.js
```

## Verify the app is running

Open a browser or use curl/PowerShell to check the health endpoint:

```bash
curl http://localhost:5000/health
```

or in PowerShell:

```powershell
Invoke-WebRequest http://localhost:5000/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "CareerMatch AI API"
}
```

## Core API endpoints

### Authentication

- POST /api/auth/register
- POST /api/auth/login

Example register request:

```json
{
  "name": "Aisha Khan",
  "email": "aisha@example.com",
  "password": "StrongPass123!"
}
```

### Resume management

- POST /api/resumes/upload

Example request body:

```json
{
  "candidateName": "Aisha Khan",
  "targetRole": "Data Analyst",
  "resumeText": "Data Analyst with Python, SQL, Tableau, and Excel."
}
```

### Job description analysis

- POST /api/jd/analyze

Example request body:

```json
{
  "title": "Data Analyst",
  "company": "Nova Analytics",
  "text": "We are looking for a Data Analyst with SQL, Python, Tableau, and statistics."
}
```

### Matching

- POST /api/match

Example request body:

```json
{
  "resumeId": "<resume-id>",
  "jdId": "<jd-id>"
}
```

### Dashboard

- GET /api/dashboard
- GET /api/readiness
- GET /api/ai/status

### Intelligence

- POST /api/skill-gap-analysis
- POST /api/resume-ai/suggestions
- GET /api/resumes/:id/evidence
- POST /api/interview/start
- POST /api/interview/answer
- GET /api/jobs
- POST /api/matches/compare

Resume image uploads use the optional Tesseract.js OCR dependency. If OCR is unavailable or confidence is low, the API returns an extraction warning and the UI keeps manual text entry available.

This endpoint requires authentication.

## Testing locally

Run the automated verification script:

```bash
npm test
```

This verifies:

- health endpoint works
- registration works
- login works
- resume upload works
- JD analysis works
- EAMS scoring and contributions work
- evidence classification works
- roadmap prioritization works
- truth-guarded resume suggestions work
- adaptive interview selection works
- readiness calculations work
- multi-job comparison works
- cross-user match access is denied

## Expected outcome

The local backend should start successfully and return a 200 response at the health endpoint. The current implementation remains an in-memory development deployment; MongoDB persistence, production secret management, OCR service deployment, and external AI provider integration remain deployment work.

## Deployment readiness

- Frontend deployment config: [client/vercel.json](client/vercel.json)
- Backend deployment config: [railway.json](railway.json)
- Store `JWT_SECRET`, database credentials, and AI provider keys in deployment environment variables.
- Do not use the development JWT fallback in production.
- `npm audit --omit=dev` reports two moderate transitive `qs` advisories through Express 4; resolving them requires a planned Express-major migration.
