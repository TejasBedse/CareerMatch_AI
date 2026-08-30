# CareerMatch AI --- Complete Product & Engineering Specification

**Version:** 1.0\
**Academic Project:** CareerMatch AI\
**Department:** CSE -- Data Science\
**Academic Year:** 2026--2027\
**Primary Users:** Students, fresh graduates, internship/job seekers,
placement cells, and optionally recruiters.

------------------------------------------------------------------------

# 1. Project Overview

Build a full-stack AI-powered career intelligence platform called
**CareerMatch AI**.

CareerMatch AI analyzes a candidate's resume against a target Job
Description (JD), explains the match, identifies skill gaps, recommends
an improvement plan, helps tailor the resume, prepares the candidate for
interviews, and tracks progress toward becoming job-ready.

The system must go beyond a simple ATS keyword checker or a basic resume
score.

The core product flow is:

**Resume + Job Description → Resume Understanding → JD Understanding →
Hybrid Matching → Explainable Match Report → Skill Gap → Personalized
Improvement Roadmap → Resume Tailoring → Adaptive Interview Practice →
Readiness Tracking**

The base research direction is inspired by the paper **"Nexus: A
Multi-Modal Framework for Semantic Job Matching and AI-Driven Resume
Analysis."** The base work uses resume parsing, OCR fallback, hybrid
NER, curated skill dictionaries, BERT/SBERT semantic matching, dynamic
ranking, LLM-based resume evaluation, and career assistance.

CareerMatch AI extends this direction by focusing strongly on direct
Resume--JD comparison, explainability, actionable skill-gap analysis,
personalized interview preparation, progress tracking, and
decision-support features.

------------------------------------------------------------------------

# 2. Problem Statement

Traditional resume screening and career tools often focus on keyword
overlap or provide a single match score.

This creates several problems:

-   A candidate may have the right ability but use different terminology
    from the JD.
-   Candidates often do not know why they received a particular score.
-   Missing skills are not converted into an actionable learning plan.
-   Resume suggestions are often generic.
-   Interview preparation is not sufficiently connected to the
    candidate's actual resume and target JD.
-   Candidates cannot easily understand whether they are ready to apply
    now or should improve first.
-   Repeatedly applying to unsuitable jobs wastes time.
-   AI-generated recommendations can be inconsistent or unsupported by
    evidence.

CareerMatch AI addresses these problems using hybrid semantic matching,
structured extraction, explainable scoring, personalized
recommendations, and an adaptive career-preparation loop.

------------------------------------------------------------------------

# 3. Product Goals

CareerMatch AI must:

1.  Parse PDF and DOCX resumes.
2.  Support OCR for scanned resumes.
3.  Extract skills, education, experience, projects, certifications,
    achievements, and job titles.
4.  Analyze a Job Description.
5.  Separate required and preferred qualifications.
6.  Detect skills, technologies, responsibilities, experience
    requirements, education requirements, and domain requirements.
7.  Compare the candidate with the JD using both exact/keyword and
    semantic matching.
8.  Produce an explainable compatibility score.
9.  Show matched, partially matched, and missing requirements.
10. Distinguish critical gaps from low-priority gaps.
11. Provide ATS-oriented resume feedback.
12. Generate JD-specific resume improvement suggestions.
13. Generate a tailored resume draft while preserving factual
    information.
14. Generate technical, HR, behavioral, and resume/JD-specific interview
    questions.
15. Evaluate practice answers.
16. Adapt future questions based on previous answers.
17. Calculate an interview-readiness score.
18. Create a personalized skill-improvement roadmap.
19. Track candidate progress over time.
20. Provide job-application decision support.
21. Protect sensitive resume and personal data.
22. Provide transparent explanations instead of unexplained AI scores.

------------------------------------------------------------------------

# 4. Differentiating / Advanced Features

These features are intended to make CareerMatch AI substantially more
useful than a basic resume matcher.

> Important: These are proposed differentiators. The system should not
> claim that a feature is globally unique unless a proper
> market/research comparison has verified that claim.

## 4.1 Career Twin

Create a structured digital representation of the candidate:

-   Current skills
-   Skill proficiency evidence
-   Education
-   Projects
-   Experience
-   Certifications
-   Preferred roles
-   Career interests
-   Target industries
-   Interview performance
-   Skill gaps
-   Learning progress

The Career Twin becomes the central profile used by other AI modules.

------------------------------------------------------------------------

## 4.2 Evidence-Based Skill Verification

Do not treat every resume skill as equally trustworthy.

For each skill, identify evidence such as:

-   Project
-   Internship
-   Work experience
-   Certification
-   Coursework
-   Achievement

Example:

**Python --- Strong evidence**

Evidence: - Used in 3 projects - Mentioned in internship - Used with
Pandas and NumPy

This reduces the problem of blindly trusting a skill keyword.

------------------------------------------------------------------------

## 4.3 Explainable Match Score

Never show only:

**Match = 78%**

Instead show a factorized score.

Example:

-   Required skills: 86%
-   Preferred skills: 64%
-   Semantic similarity: 82%
-   Experience alignment: 75%
-   Education alignment: 100%
-   Project relevance: 88%
-   Evidence strength: 79%

Then calculate the final score using configurable weights.

The UI must explain:

**"Why did I get this score?"**

------------------------------------------------------------------------

## 4.4 Critical Gap Detector

Not every missing skill has equal importance.

Classify gaps as:

-   Critical
-   High
-   Medium
-   Low

Example:

> SQL --- Critical gap\
> Required by JD and appears repeatedly in responsibilities.

This helps candidates prioritize what to learn first.

------------------------------------------------------------------------

## 4.5 Gap-to-Action Roadmap

Convert missing skills into a concrete action plan.

Example:

``` text
Missing Skill: SQL
        ↓
Learning Goal
        ↓
3 Recommended Topics
        ↓
Practice Task
        ↓
Mini Project
        ↓
Evidence Added to Career Twin
        ↓
Recalculate Job Readiness
```

The roadmap should have progress tracking.

------------------------------------------------------------------------

## 4.6 Counterfactual Resume Simulator

Allow the candidate to test hypothetical improvements without falsely
changing their real resume.

Example:

> "What happens if I add a genuine SQL project?"

The system should show:

-   Current match score
-   Estimated score after adding the project
-   Which JD requirements would improve
-   Which requirements would remain missing

The system must clearly label this as a **simulation**, not as proof of
a qualification.

------------------------------------------------------------------------

## 4.7 Resume Truth Guard

AI must not invent:

-   Experience
-   Projects
-   Certifications
-   Job titles
-   Technologies
-   Achievements

When generating resume content, the system must distinguish:

**Existing evidence**

from

**Suggested improvement**

This is a core trust feature.

------------------------------------------------------------------------

## 4.8 Adaptive Mock Interview

Instead of generating a random list of questions:

``` text
JD + Resume
     ↓
Question
     ↓
Candidate Answer
     ↓
Evaluation
     ↓
Weak Area Detection
     ↓
Next Question Adapted to Weak Area
```

The interview should progressively become more personalized.

------------------------------------------------------------------------

## 4.9 Interview Weakness Map

Track weaknesses such as:

-   Technical knowledge
-   Communication
-   Project explanation
-   Problem solving
-   Behavioral answers
-   Resume consistency
-   Confidence/clarity indicators

The system should provide improvement suggestions without making
unsupported psychological or personality diagnoses.

------------------------------------------------------------------------

## 4.10 Job Application Readiness Gate

Before applying, show:

**Apply Now / Apply After Improvement / Low Match**

with reasons.

Example:

> Apply After Improvement\
> Match: 71%\
> Critical gap: Docker\
> Strong alignment: Python, SQL, REST APIs\
> Recommended action: complete Docker mini-project.

This is decision support, not an automatic hiring prediction.

------------------------------------------------------------------------

## 4.11 Multi-JD Career Fit Map

Allow one resume to be compared against multiple target roles.

Example:

``` text
Data Analyst       84%
Data Scientist     68%
ML Engineer        61%
Business Analyst   77%
```

Then show which skills create the differences.

------------------------------------------------------------------------

## 4.12 Career Path Simulator

Based on the candidate's current Career Twin, allow:

> "What should I improve to move from Data Analyst to Data Scientist?"

Generate:

-   Current strengths
-   Missing skills
-   Recommended sequence
-   Project recommendations
-   Interview preparation areas
-   Estimated readiness milestones

The system must avoid presenting speculative salary or employment
outcomes as facts.

------------------------------------------------------------------------

## 4.13 Resume Version Intelligence

Maintain resume versions for different target roles:

-   Data Analyst Resume
-   Data Scientist Resume
-   ML Intern Resume

Compare versions and show:

-   Which JD each version targets
-   Match score
-   Changed sections
-   Missing evidence

------------------------------------------------------------------------

## 4.14 Job Description Quality Analyzer

Before matching, analyze whether a JD itself is clear.

Detect:

-   Missing salary information
-   Vague responsibilities
-   Excessive requirements
-   Duplicate requirements
-   Unrealistic experience/skill combinations
-   Suspicious or inconsistent requirements

This is a transparency aid and must not automatically label a company or
job as fraudulent.

------------------------------------------------------------------------

## 4.15 Application Feedback Loop

After an application, the candidate can record:

-   Applied
-   Assessment
-   Interview
-   Rejected
-   Selected

The system can summarize patterns across the candidate's own application
history.

Example:

> "Your applications for roles requiring strong SQL and Power BI skills
> have a higher match score than your applications for ML-heavy roles."

It should not claim causal conclusions from small datasets.

------------------------------------------------------------------------

# 5. Core Functional Modules

## Module A --- Authentication

-   Register
-   Login
-   Logout
-   JWT-based session
-   Password hashing
-   Protected routes
-   Profile management

------------------------------------------------------------------------

## Module B --- Resume Management

Features:

-   Upload PDF
-   Upload DOCX
-   OCR for scanned PDF
-   Resume text extraction
-   Section detection
-   Resume preview
-   Parsed information review
-   Manual correction
-   Save multiple resume versions
-   Delete resume

Resume sections:

-   Personal/contact information
-   Summary
-   Education
-   Skills
-   Experience
-   Projects
-   Certifications
-   Achievements
-   Publications
-   Extracurricular activities

------------------------------------------------------------------------

## Module C --- Resume Parser

Pipeline:

``` text
Upload
  ↓
File Validation
  ↓
Text Extraction
  ↓
OCR Fallback
  ↓
Cleaning
  ↓
Section Detection
  ↓
NER
  ↓
Skill Dictionary
  ↓
Structured Candidate Profile
```

The parser should combine transformer-based extraction with curated
technical skill dictionaries.

------------------------------------------------------------------------

# 6. Job Description Analyzer

Input methods:

-   Paste JD text
-   Upload JD document
-   Optional URL import where legally and technically supported

Extract:

-   Job title
-   Company
-   Required skills
-   Preferred skills
-   Education
-   Experience
-   Responsibilities
-   Tools/technologies
-   Domain
-   Certifications
-   Soft skills
-   Location
-   Employment type

Classify every requirement:

``` text
REQUIRED
PREFERRED
RESPONSIBILITY
CONTEXTUAL
```

------------------------------------------------------------------------

# 7. Matching Engine

The matching engine must use multiple signals.

## 7.1 Keyword Matching

Compare normalized terms.

Examples:

``` text
Python ↔ Python
SQL ↔ SQL
Machine Learning ↔ ML
```

------------------------------------------------------------------------

## 7.2 Semantic Matching

Use BERT/Sentence-BERT embeddings to identify related concepts.

Example:

``` text
“data visualization”
        ↔
“creating dashboards and analytical reports”
```

------------------------------------------------------------------------

## 7.3 Compatibility Factors

Consider:

-   Skill alignment
-   Semantic similarity
-   Required skill coverage
-   Preferred skill coverage
-   Experience alignment
-   Education alignment
-   Project relevance
-   Certification relevance
-   Evidence strength

------------------------------------------------------------------------

# 8. Explainable Result

The result page must contain:

## Overall Score

Example:

**82 / 100 --- Strong Match**

## Strengths

-   Python
-   SQL
-   Pandas
-   Data visualization

## Partial Matches

-   Machine learning
-   Cloud

## Missing / Critical

-   Docker
-   AWS

## Why This Score?

Show factor-by-factor reasoning.

## Recommended Actions

Prioritize actions by expected usefulness.

------------------------------------------------------------------------

# 9. Resume Improvement Engine

Provide:

-   ATS feedback
-   Missing keywords
-   Weak bullet detection
-   Generic statement detection
-   Section completeness
-   JD alignment
-   Action verb suggestions
-   Quantification suggestions
-   Formatting guidance

The AI must never fabricate achievements.

Example:

Bad:

> "Increased sales by 40%."

if no evidence exists.

Better:

> "If you have measurable results, consider adding them here."

------------------------------------------------------------------------

# 10. AI Resume Tailoring

Input:

-   Existing resume
-   Target JD
-   User-approved information

Output:

-   Suggested summary
-   Suggested skill ordering
-   Suggested project ordering
-   JD-aligned bullet improvements
-   ATS keyword suggestions

Every generated statement must be marked as:

**Based on existing information**

or

**Suggested wording --- verify before using**

------------------------------------------------------------------------

# 11. Interview Preparation

Question categories:

### Technical

-   Skill-specific
-   Role-specific
-   Project-specific
-   Conceptual
-   Problem solving

### HR

-   Introduction
-   Strengths
-   Challenges
-   Motivation
-   Career goals

### Behavioral

Use structured scenarios where appropriate.

### Resume/JD Specific

Questions should reference the candidate's actual projects and the
target JD.

------------------------------------------------------------------------

# 12. Adaptive Interview Engine

Maintain interview session state.

Each answer receives feedback on:

-   Relevance
-   Completeness
-   Technical correctness
-   Structure
-   Clarity
-   Evidence/example usage

Then choose the next question based on weaknesses.

The system should not pretend to measure hidden psychological traits.

------------------------------------------------------------------------

# 13. Interview Readiness Score

Provide a transparent score based on observed practice performance.

Example:

``` text
Technical:       78
Resume Defense:  86
Behavioral:      72
Problem Solving: 80
Overall:         79
```

Display:

-   Strong areas
-   Weak areas
-   Recommended practice
-   Previous vs current performance

------------------------------------------------------------------------

# 14. Skill Roadmap

For each missing skill:

``` text
Skill
 ↓
Importance
 ↓
Current evidence
 ↓
Learning objectives
 ↓
Practice task
 ↓
Mini project
 ↓
Verification/evidence
 ↓
Progress
```

Users can mark:

-   Not Started
-   Learning
-   Practicing
-   Demonstrated

------------------------------------------------------------------------

# 15. Career Dashboard

Dashboard widgets:

-   Resume health
-   Current Career Twin
-   Selected target role
-   Best matching roles
-   Average JD match
-   Critical skill gaps
-   Interview readiness
-   Roadmap progress
-   Applications
-   Resume versions

------------------------------------------------------------------------

# 16. Job Matching

Optional job discovery module.

Where a legitimate job API/data source is available, support:

-   Search
-   Filtering
-   Ranking
-   Skill-based matching
-   Match explanation

The base paper demonstrates job search and ranked matching as part of
the research direction.

The application must respect the terms and API policies of any external
job provider.

------------------------------------------------------------------------

# 17. Application Tracker

Track:

``` text
Saved
 ↓
Applied
 ↓
Assessment
 ↓
Interview
 ↓
Offer / Rejected
```

Store:

-   Company
-   Role
-   Date
-   Resume version
-   Match score
-   Interview status
-   Notes

------------------------------------------------------------------------

# 18. Recruiter / Placement Cell Mode

Optional role-based module.

Recruiters or placement staff can:

-   Create job requirements
-   Upload JD
-   Review candidate matches
-   Filter candidates by verified skills
-   View explainable matching factors
-   Export reports

The system must avoid making final hiring decisions automatically.

------------------------------------------------------------------------

# 19. Technology Stack

## Frontend

-   Next.js
-   React
-   Tailwind CSS
-   Zustand
-   Axios
-   Recharts
-   Lucide React

## Backend

-   Node.js
-   Express
-   MongoDB
-   Mongoose
-   JWT
-   bcryptjs
-   express-validator
-   helmet
-   morgan
-   compression

## AI / NLP

-   Python service where ML processing is appropriate
-   PyMuPDF
-   OCR
-   spaCy
-   BERT
-   Sentence-BERT / sentence-transformers
-   OpenAI-compatible LLM API or OpenRouter
-   Google Gemini as configurable provider

## Optional Infrastructure

-   Redis
-   Background job queue
-   Socket.IO
-   Docker

The architecture should remain usable locally without requiring every
external service.

------------------------------------------------------------------------

# 20. AI Architecture

``` text
                    ┌──────────────────┐
                    │  CareerMatch UI  │
                    └────────┬─────────┘
                             │
                    Resume + JD + User Input
                             │
                             ▼
                  ┌─────────────────────┐
                  │ API / Orchestrator  │
                  └──────────┬──────────┘
                             │
             ┌───────────────┼────────────────┐
             ▼               ▼                ▼
       Resume Parser      JD Analyzer    Career Twin
             │               │                │
             └───────────────┼────────────────┘
                             ▼
                    Matching Engine
                             │
                 ┌───────────┼───────────┐
                 ▼           ▼           ▼
            Score Engine  Gap Engine  Evidence Engine
                 │           │           │
                 └───────────┼───────────┘
                             ▼
                    Explainable Report
                             │
       ┌─────────────────────┼─────────────────────┐
       ▼                     ▼                     ▼
 Resume Assistant     Skill Roadmap       Interview Engine
       │                     │                     │
       └─────────────────────┼─────────────────────┘
                             ▼
                       Career Dashboard
```

------------------------------------------------------------------------

# 21. Database Collections

## users

``` text
_id
name
email
passwordHash
role
createdAt
updatedAt
```

## resumes

``` text
_id
userId
name
fileType
filePath
parsedText
structuredProfile
version
createdAt
updatedAt
```

## jobDescriptions

``` text
_id
userId
title
company
rawText
requirements
preferredSkills
responsibilities
metadata
createdAt
```

## matchReports

``` text
_id
userId
resumeId
jobDescriptionId
overallScore
factorScores
matchedSkills
partialSkills
missingSkills
criticalGaps
explanations
recommendations
createdAt
```

## careerProfiles

``` text
_id
userId
skills
skillEvidence
education
experience
projects
certifications
targetRoles
careerGoals
updatedAt
```

## roadmaps

``` text
_id
userId
targetRole
skills
milestones
progress
createdAt
updatedAt
```

## interviewSessions

``` text
_id
userId
jobDescriptionId
resumeId
questions
answers
evaluations
readinessScore
createdAt
completedAt
```

## applications

``` text
_id
userId
company
role
jobDescriptionId
resumeId
matchScore
status
notes
appliedAt
updatedAt
```

## resumeVersions

``` text
_id
userId
baseResumeId
targetRole
content
changes
createdAt
```

## notifications

``` text
_id
userId
type
title
message
read
createdAt
```

------------------------------------------------------------------------

# 22. Backend Architecture

Use a layered architecture:

``` text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Models / AI / External Providers
```

Controllers must remain thin.

Business logic belongs in services.

Suggested structure:

``` text
server/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   │   ├── resumeService.js
│   │   ├── jdService.js
│   │   ├── matchingService.js
│   │   ├── roadmapService.js
│   │   ├── interviewService.js
│   │   └── careerTwinService.js
│   ├── ai/
│   ├── integrations/
│   ├── utils/
│   └── app.js
└── package.json
```

------------------------------------------------------------------------

# 23. API Endpoints

## Authentication

``` text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

## Resumes

``` text
POST   /api/resumes
GET    /api/resumes
GET    /api/resumes/:id
PUT    /api/resumes/:id
DELETE /api/resumes/:id
POST   /api/resumes/:id/parse
```

## Job Descriptions

``` text
POST   /api/jobs
GET    /api/jobs
GET    /api/jobs/:id
PUT    /api/jobs/:id
DELETE /api/jobs/:id
POST   /api/jobs/analyze
```

## Matching

``` text
POST /api/matches
GET  /api/matches
GET  /api/matches/:id
```

## Career Twin

``` text
GET /api/career-twin
PUT /api/career-twin
GET /api/career-twin/skills
GET /api/career-twin/evidence
```

## Resume AI

``` text
POST /api/resume-ai/analyze
POST /api/resume-ai/tailor
POST /api/resume-ai/suggestions
```

## Roadmap

``` text
POST /api/roadmaps
GET  /api/roadmaps
GET  /api/roadmaps/:id
PUT  /api/roadmaps/:id
POST /api/roadmaps/:id/milestones
```

## Interviews

``` text
POST /api/interviews
GET  /api/interviews
GET  /api/interviews/:id
POST /api/interviews/:id/next-question
POST /api/interviews/:id/answer
GET  /api/interviews/:id/report
```

## Applications

``` text
POST   /api/applications
GET    /api/applications
PUT    /api/applications/:id
DELETE /api/applications/:id
```

## Notifications

``` text
GET  /api/notifications
PUT  /api/notifications/:id/read
PUT  /api/notifications/read-all
```

------------------------------------------------------------------------

# 24. Frontend Pages

``` text
/
├── Landing Page
├── login
├── register
├── dashboard
├── resume
├── resume/upload
├── resume/:id
├── jobs
├── jobs/create
├── jobs/:id
├── match/:id
├── career-twin
├── roadmap
├── interview
├── interview/:id
├── applications
├── resume-builder
├── reports
└── settings
```

------------------------------------------------------------------------

# 25. Main User Journey

## First-Time User

``` text
Register
 ↓
Upload Resume
 ↓
Resume Parsing
 ↓
Review Extracted Information
 ↓
Career Twin Created
 ↓
Select Target Role
 ↓
Paste / Upload JD
 ↓
Analyze Match
 ↓
View Explainable Report
```

## Improvement Journey

``` text
Missing Skills
 ↓
Prioritize Critical Gaps
 ↓
Generate Roadmap
 ↓
Complete Learning/Project Tasks
 ↓
Add Evidence
 ↓
Recalculate Readiness
```

## Interview Journey

``` text
Select Job
 ↓
Start Mock Interview
 ↓
Question
 ↓
Answer
 ↓
AI Evaluation
 ↓
Adaptive Next Question
 ↓
Readiness Report
```

------------------------------------------------------------------------

# 26. UI/UX Requirements

The UI must be:

-   Clean
-   Modern
-   Responsive
-   Student-friendly
-   Accessible
-   Easy to understand
-   Explainable

Avoid overwhelming users with AI terminology.

Use clear labels such as:

**"Why this score?"**

**"What should I improve first?"**

**"What evidence supports this skill?"**

**"Am I ready to apply?"**

**"Practice this weak area"**

------------------------------------------------------------------------

# 27. Match Result UI

Example:

``` text
┌─────────────────────────────────────┐
│         CAREERMATCH RESULT          │
│                                     │
│             82 / 100                │
│           Strong Match              │
│                                     │
│ Required Skills       88%           │
│ Preferred Skills      70%           │
│ Experience            78%           │
│ Semantic Match        84%           │
│ Project Relevance     90%           │
└─────────────────────────────────────┘

STRONG MATCHES
✓ Python
✓ SQL
✓ Pandas
✓ Data Visualization

PARTIAL MATCHES
~ Machine Learning

CRITICAL GAPS
! Docker
! AWS

[Why this score?] [Build my roadmap]
```

------------------------------------------------------------------------

# 28. Security Requirements

The system must:

-   Hash passwords using bcrypt.
-   Use JWT securely.
-   Validate uploaded file types.
-   Limit upload size.
-   Sanitize user inputs.
-   Protect private resume data.
-   Never expose API keys in frontend code.
-   Keep secrets in environment variables.
-   Avoid storing unnecessary personal information.
-   Provide account/data deletion capability.
-   Avoid logging resume contents or sensitive personal data.
-   Apply authorization checks to every user-owned resource.

------------------------------------------------------------------------

# 29. AI Safety & Reliability

The AI must:

1.  Never fabricate candidate experience.
2.  Never invent certifications.
3.  Never claim a candidate is guaranteed to get a job.
4.  Clearly distinguish predictions/suggestions from verified facts.
5.  Show evidence behind important recommendations.
6.  Allow users to correct parsed resume data.
7.  Use deterministic calculations for match scores where possible.
8.  Use LLMs primarily for explanation, generation, and assistance.
9.  Handle uncertain extraction explicitly.
10. Avoid discriminatory ranking based on protected characteristics.

------------------------------------------------------------------------

# 30. Fallback Behavior

The application must remain usable during local development.

If an external LLM is unavailable:

``` text
LLM unavailable
     ↓
Template/rule-based fallback
     ↓
Basic analysis still available
```

If OCR fails:

``` text
OCR failure
 ↓
Show extraction warning
 ↓
Allow manual text entry
```

If semantic model is unavailable:

``` text
Embedding service unavailable
 ↓
Keyword/skill matching fallback
```

If MongoDB is unavailable during development, a clearly separated
in-memory development fallback may be used.

------------------------------------------------------------------------

# 31. Matching Algorithm

A baseline explainable score may use:

``` text
Final Score =
0.35 × Required Skill Coverage
+ 0.15 × Preferred Skill Coverage
+ 0.20 × Semantic Similarity
+ 0.10 × Experience Alignment
+ 0.10 × Project Relevance
+ 0.05 × Education Alignment
+ 0.05 × Evidence Strength
```

These weights must be configurable and evaluated using labelled
examples.

Do not claim the weights are scientifically optimal without experimental
validation.

------------------------------------------------------------------------

# 32. Evaluation Plan

Evaluate at multiple levels.

## Resume Extraction

Metrics:

-   Precision
-   Recall
-   F1 score

Evaluate:

-   Skills
-   Education
-   Experience
-   Projects
-   Job titles

## Matching

Compare:

1.  Keyword-only baseline
2.  Semantic-only baseline
3.  Proposed hybrid model

Metrics:

-   Precision@K
-   Recall@K
-   Ranking quality
-   Human relevance judgments

## AI Recommendations

Human reviewers evaluate:

-   Relevance
-   Correctness
-   Helpfulness
-   Hallucination rate

## Interview Evaluation

Measure agreement between human evaluators and AI feedback where
feasible.

------------------------------------------------------------------------

# 33. Base Paper vs CareerMatch AI

## Base Research Direction

The Nexus research direction includes:

-   Resume parsing
-   OCR fallback
-   Hybrid NER
-   Curated skill dictionaries
-   BERT/SBERT matching
-   Job ranking
-   LLM resume evaluation
-   Career chatbot

## CareerMatch AI Extension

CareerMatch AI adds:

-   Direct Resume--JD analysis
-   Explainable multi-factor score
-   Critical skill-gap detection
-   Evidence-based skill verification
-   Career Twin
-   Gap-to-action roadmap
-   Counterfactual resume simulation
-   Resume truth guard
-   JD quality analysis
-   Adaptive mock interviews
-   Interview weakness map
-   Application readiness gate
-   Multi-JD career fit map
-   Career path simulation
-   Resume version intelligence
-   Application tracking

The extension must be evaluated separately from the baseline research
methods.

------------------------------------------------------------------------

# 34. Development Phases

The AI coding agent must build the project phase-by-phase.

Do not ask the coding agent to generate the complete application in one
step.

## Phase 1 --- Foundation

Implement:

-   Project setup
-   Authentication
-   Database
-   Base layout
-   Dashboard
-   User profile
-   Security middleware

### Verification

-   Register
-   Login
-   Logout
-   Protected route
-   Database persistence

------------------------------------------------------------------------

## Phase 2 --- Resume Intelligence

Implement:

-   PDF upload
-   DOCX upload
-   Text extraction
-   OCR fallback
-   Section detection
-   Skill extraction
-   Structured candidate profile
-   Resume review/edit

### Verification

Upload multiple resume types and compare extracted information.

------------------------------------------------------------------------

## Phase 3 --- Job Description Intelligence

Implement:

-   JD input
-   JD upload
-   Requirement extraction
-   Required/preferred classification
-   Job metadata extraction

### Verification

Test multiple JDs and inspect extracted requirements.

------------------------------------------------------------------------

## Phase 4 --- Matching Engine

Implement:

-   Keyword matching
-   Semantic matching
-   Hybrid score
-   Factorized scoring
-   Match explanations
-   Skill-gap detection
-   Critical gap classification

### Verification

Compare keyword-only, semantic-only, and hybrid results.

------------------------------------------------------------------------

## Phase 5 --- Career Intelligence

Implement:

-   Career Twin
-   Evidence tracking
-   Skill roadmap
-   Gap-to-action recommendations
-   Multi-JD comparison
-   Career path simulator
-   Job readiness gate

### Verification

Change a skill/evidence item and confirm that recommendations and
readiness update.

------------------------------------------------------------------------

## Phase 6 --- Resume AI

Implement:

-   ATS analysis
-   Resume improvement
-   JD-specific tailoring
-   Resume versions
-   Truth guard

### Verification

Ensure no unsupported experience or achievement is generated.

------------------------------------------------------------------------

## Phase 7 --- Interview Intelligence

Implement:

-   Technical questions
-   HR questions
-   Resume/JD-specific questions
-   Adaptive questioning
-   Answer evaluation
-   Readiness score
-   Weakness map

### Verification

Run complete mock interview sessions.

------------------------------------------------------------------------

## Phase 8 --- Application Intelligence

Implement:

-   Application tracker
-   Resume version association
-   Match history
-   Application analytics
-   Candidate progress dashboard

### Verification

Create, update, filter, and close applications.

------------------------------------------------------------------------

## Phase 9 --- Advanced Differentiators

Implement:

-   Counterfactual Resume Simulator
-   JD Quality Analyzer
-   Evidence-based skill verification
-   Career Path Simulator
-   Multi-JD Career Fit Map
-   Application Feedback Loop

### Verification

Each advanced feature must have its own test scenario.

------------------------------------------------------------------------

## Phase 10 --- Testing & Deployment

Verify:

-   Frontend
-   Backend
-   Database
-   APIs
-   Authentication
-   File uploads
-   AI fallbacks
-   Error handling
-   Security
-   Mobile responsiveness
-   Browser console
-   Production environment variables

Deployment target:

``` text
Frontend → Vercel
Backend  → Render / equivalent
Database → MongoDB Atlas
Source   → GitHub
```

------------------------------------------------------------------------

# 35. AI Coding Agent Rules

The coding agent MUST:

1.  Read this `spec.md` before implementation.
2.  Summarize the architecture before coding.
3.  Never change the selected framework without approval.
4.  Implement one phase at a time.
5.  Verify each phase before moving to the next.
6.  Keep controllers thin.
7.  Put business logic in services.
8.  Keep AI provider integrations behind service interfaces.
9.  Never expose secrets in frontend code.
10. Never fabricate candidate information.
11. Never replace real functionality with fake UI merely to satisfy the
    specification.
12. Report every file created or modified after each phase.
13. Report packages installed after each phase.
14. Report test commands and results.
15. Clearly identify unfinished features.
16. Prefer reusable components and services.
17. Maintain consistent API contracts between frontend and backend.
18. Preserve user data during updates and migrations.

------------------------------------------------------------------------

# 36. Required Testing Scenarios

### Scenario 1 --- Resume Upload

Upload a normal PDF resume.

Expected:

-   Text extracted
-   Sections detected
-   Skills identified
-   Structured profile generated

### Scenario 2 --- Scanned Resume

Upload a scanned PDF.

Expected:

-   OCR triggered
-   Extraction warning if confidence is low

### Scenario 3 --- JD Analysis

Paste a Data Scientist JD.

Expected:

-   Required skills identified
-   Preferred skills identified
-   Experience requirement identified

### Scenario 4 --- Matching

Compare resume and JD.

Expected:

-   Overall score
-   Factor scores
-   Strong skills
-   Partial skills
-   Missing skills
-   Explanation

### Scenario 5 --- Roadmap

For a missing critical skill:

Expected:

-   Skill priority
-   Learning objective
-   Practice task
-   Progress tracking

### Scenario 6 --- Resume Tailoring

Generate JD-specific suggestions.

Expected:

-   Existing facts preserved
-   Suggested wording clearly identified
-   No fabricated claims

### Scenario 7 --- Adaptive Interview

Answer a weak technical question.

Expected:

-   Feedback
-   Weak area identified
-   Next question adapts accordingly

### Scenario 8 --- Multi-JD

Compare one resume against several JDs.

Expected:

-   Separate scores
-   Different gaps
-   Role comparison

------------------------------------------------------------------------

# 37. Final Expected Outcome

The completed CareerMatch AI platform must allow a user to:

``` text
Create Account
      ↓
Upload Resume
      ↓
AI Understands Resume
      ↓
Build Career Twin
      ↓
Enter Target Job Description
      ↓
AI Understands JD
      ↓
Hybrid Matching
      ↓
Explainable Match Score
      ↓
Strengths + Partial Matches + Critical Gaps
      ↓
Personalized Improvement Roadmap
      ↓
Optional Resume Tailoring
      ↓
Adaptive Mock Interview
      ↓
Interview Readiness Report
      ↓
Application Decision Support
      ↓
Track Career Progress
```

The final product should feel like a **personal AI career coach +
resume/JD intelligence platform + interview preparation system**, rather
than only a resume checker.

------------------------------------------------------------------------

# 38. Definition of Done

CareerMatch AI is considered complete only when:

-   Authentication works.
-   Resume upload works.
-   PDF/DOCX parsing works.
-   OCR fallback works.
-   Structured extraction works.
-   JD analysis works.
-   Hybrid matching works.
-   Explainable score works.
-   Skill gaps work.
-   Career Twin works.
-   Roadmap works.
-   Resume AI works.
-   Interview generation works.
-   Adaptive interview works.
-   Readiness report works.
-   Application tracking works.
-   Database persistence works.
-   Security controls work.
-   Fallback behavior works.
-   Major frontend and backend errors are resolved.
-   The application is tested end-to-end.
-   The application is deployed successfully.
-   Documentation explains architecture, algorithms, limitations, and
    evaluation.

------------------------------------------------------------------------

# 39. Important Academic Limitations

The project must explicitly acknowledge:

-   Resume formatting variation
-   OCR errors
-   Domain-specific skill extraction limitations
-   Semantic matching limitations
-   LLM hallucination risk
-   Match-score weighting requiring validation
-   Recruitment bias
-   Privacy concerns
-   External API cost and availability
-   Small evaluation datasets

The system should be presented as **career decision support**, not as an
authoritative hiring or employment prediction system.

------------------------------------------------------------------------

# 40. Project Success Criteria

## Minimum

-   Resume parser
-   JD analyzer
-   Hybrid matching
-   Explainable score
-   Skill gaps
-   Basic AI recommendations
-   Working web application

## Good

-   Minimum features
-   Career Twin
-   Roadmap
-   Resume tailoring
-   Interview preparation
-   Application tracker

## Excellent

-   Strong UI/UX
-   Adaptive interview
-   Evidence-based skills
-   Multi-JD comparison
-   Counterfactual simulation
-   Robust evaluation
-   Strong security

## Outstanding

-   All major features
-   Reliable AI integration
-   Strong baseline comparison
-   Measurable research evaluation
-   Excellent explainability
-   Privacy-first architecture
-   Production-quality deployment
-   Polished end-to-end user experience
