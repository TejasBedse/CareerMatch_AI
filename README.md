# CareerMatch AI

CareerMatch AI is a full-stack career intelligence platform built from the project specification in [CareerMatch_AI_spec.md](CareerMatch_AI_spec.md). This repository currently includes the working backend MVP that handles authentication, resume parsing, job description analysis, explainable matching, and basic dashboard data.

## Project status

- Backend API: implemented
- Authentication: implemented with JWT
- Resume upload and parsing: implemented
- JD analysis: implemented
- Match engine: implemented
- Test coverage: included for core flows
- Frontend UI: not yet implemented in this workspace

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
- [server/test/test-all.js](server/test/test-all.js) — verification tests for authentication and job-match flow

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
- matching works

## Expected outcome

The local backend should start successfully and return a 200 response at the health endpoint. The API is ready to support future front-end development and additional feature modules from the spec, including:

- resume versioning
- adaptive mock interviews
- roadmap tracking
- application feedback loops
- multi-role comparison

## Next development steps

The next milestone after this backend MVP is to build the frontend UI and connect it to the existing API endpoints. The project can then expand into the full product flow described in [CareerMatch_AI_spec.md](CareerMatch_AI_spec.md).
