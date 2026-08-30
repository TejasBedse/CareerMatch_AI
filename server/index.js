const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'careermatch-dev-secret';

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

const users = new Map();
const resumes = new Map();
const jds = new Map();
const matches = new Map();
const applications = new Map();
const roadmapProgress = new Map();
const interviewSessions = new Map();

function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const tokenFromBody = req.body && req.body.token ? req.body.token : null;
  const tokenFromQuery = req.query && req.query.token ? req.query.token : null;
  const token = tokenFromHeader || tokenFromBody || tokenFromQuery;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

function normalizeSkillValue(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9+\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSkillsFromText(text = '') {
  const textLower = text.toLowerCase();
  const skillHints = [
    // Programming Languages
    'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go', 'rust', 'php', 'ruby', 'swift',
    'kotlin', 'scala', 'perl', 'r', 'matlab', 'vb.net', 'groovy', 'dart', 'elixir',
    // Frontend
    'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt', 'html', 'css', 'sass', 'webpack',
    // Backend & Databases
    'node', 'express', 'django', 'flask', 'spring', 'fastapi', 'asp.net', 'laravel',
    'sql', 'postgresql', 'mongodb', 'mysql', 'oracle', 'redis', 'dynamodb', 'cassandra',
    'elasticsearch', 'firestore', 'elasticsearch',
    // Data & Analytics
    'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'keras', 'spark', 'hadoop',
    'machine learning', 'ml', 'deep learning', 'nlp', 'data analysis', 'statistics', 'tableau',
    'power bi', 'looker', 'excel', 'etl', 'data warehouse', 'data lake',
    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github',
    'terraform', 'ansible', 'cloudformation', 'helm', 'ci/cd', 'devops',
    // APIs & Architectures
    'rest api', 'graphql', 'microservices', 'soap', 'grpc', 'api design', 'system design',
    // Testing & QA
    'junit', 'pytest', 'jest', 'mocha', 'selenium', 'cypress', 'postman', 'jira',
    'test automation', 'unit testing', 'integration testing',
    // Other Tools
    'git', 'linux', 'unix', 'agile', 'scrum', 'jira', 'confluence', 'slack'
  ];

  const found = new Set();
  for (const skill of skillHints) {
    // Escape all special regex characters properly
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const skillPattern = new RegExp(`\\b${escaped}\\b`, 'gi');
    if (skillPattern.test(textLower)) found.add(normalizeSkillValue(skill));
  }

  // Extract additional skills using pattern matching
  const patterns = [
    /\b(?:proficient|expertise|expert|skilled|experience)\s+(?:in|with)\s+([\w\s+]+?)(?:[.,;]|\s(?:and|or|with))/gi,
    /(?:tools?|technologies?|frameworks?)[:\s]+([\w\s+,&.\-]+?)(?:[.,;]|$)/gi
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(textLower)) !== null) {
      const skills = match[1].split(/[,&]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 30);
      for (const skill of skills) {
        if (skill.length > 2) found.add(normalizeSkillValue(skill));
      }
    }
  }

  return Array.from(found).sort();
}

function inferStructureFromResume(text = '') {
  const cleaned = String(text || '').trim();
  const skills = extractSkillsFromText(cleaned);

  return {
    candidateName: cleaned.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/)?.[0] || 'Candidate',
    skills,
    education: cleaned.match(/(?:b\.sc|b\.tech|m\.sc|mba|bachelor|master|phd|degree|education)[^\n]{0,120}/i)?.[0] || 'Education details not specified',
    experience: cleaned.match(/(?:experience|internship|worked|role|developer|analyst)[^\n]{0,160}/i)?.[0] || 'Experience details not specified',
    summary: cleaned.slice(0, 220) || 'No summary provided',
  };
}

function calculateMatchScore(resumeProfile, jdProfile) {
  const resumeSkills = new Set((resumeProfile.skills || []).map(normalizeSkillValue));
  const requiredSkills = jdProfile.requiredSkills || [];
  const preferredSkills = jdProfile.preferredSkills || [];

  const matchedRequired = requiredSkills.filter((skill) => resumeSkills.has(normalizeSkillValue(skill)));
  const gappedRequired = requiredSkills.filter((skill) => !resumeSkills.has(normalizeSkillValue(skill)));
  const matchedPreferred = preferredSkills.filter((skill) => resumeSkills.has(normalizeSkillValue(skill)));

  // Weighted scoring formula
  const requiredCoverage = requiredSkills.length ? (matchedRequired.length / requiredSkills.length) * 100 : 100;
  const preferredCoverage = preferredSkills.length ? (matchedPreferred.length / preferredSkills.length) * 100 : 80;
  
  // Scoring breakdown
  const requiredSkillScore = Math.min(100, requiredCoverage);
  const preferredSkillScore = Math.min(100, preferredCoverage * 0.5 + 50);
  const semanticBoost = Math.min(100, 65 + (matchedRequired.length * 8));
  const experienceScore = resumeProfile.experience ? Math.min(100, 60 + (matchedRequired.length * 5)) : 40;
  
  // Final weighted score
  const finalScore = Math.round(
    (requiredSkillScore * 0.45) + 
    (preferredSkillScore * 0.15) + 
    (semanticBoost * 0.25) + 
    (experienceScore * 0.15)
  );

  return {
    overallScore: Math.max(0, Math.min(100, finalScore)),
    strengths: matchedRequired.slice(0, 5),
    gaps: gappedRequired.slice(0, 5),
    matchedPreferred: matchedPreferred.slice(0, 3),
    scoringBreakdown: {
      requiredSkills: requiredSkillScore,
      preferredSkills: preferredSkillScore,
      semanticMatch: semanticBoost,
      experienceAlignment: experienceScore,
    },
    readiness: finalScore >= 80 ? 'Ready to Apply' : finalScore >= 60 ? 'Good Fit - Minor Gaps' : finalScore >= 40 ? 'Possible Fit - Notable Gaps' : 'Not a Strong Match',
    recommendations: generateRecommendations(gappedRequired, matchedRequired, finalScore),
  };
}

function generateRecommendations(gaps, matches, score) {
  const recommendations = [];
  
  if (gaps.length > 0) {
    recommendations.push(`Learn these critical skills: ${gaps.slice(0, 3).join(', ')}.`);
  }
  
  if (matches.length >= 3) {
    recommendations.push(`Highlight your expertise in: ${matches.slice(0, 3).join(', ')} in your resume summary.`);
  }
  
  if (score < 70) {
    recommendations.push(`Consider gaining more experience with the core tech stack before applying.`);
  }
  
  recommendations.push('Tailor your resume description to match JD terminology and priorities.');
  
  return recommendations.slice(0, 4);
}

function buildJdProfile(jdInput) {
  const text = String(jdInput.text || '');
  const textLower = text.toLowerCase();
  const allSkills = extractSkillsFromText(text);

  // Better parsing: extract required vs preferred skills
  const requiredSection = text.match(/(?:requirements?|qualifications?|required)[:\s]*([^]*?)(?:preferred|nice to have|responsibilities|$)/i)?.[1] || '';
  const preferredSection = text.match(/(?:preferred|nice to have|bonus)[:\s]*([^]*?)(?:responsibilities|$)/i)?.[1] || '';

  const requiredSkills = allSkills.filter(skill => {
    const skillText = skill.toLowerCase();
    return requiredSection.toLowerCase().includes(skillText) || 
           (textLower.includes(skillText) && /\b(?:required|must|need|essential|critical)\b/i.test(requiredSection || text));
  });

  const preferredSkills = allSkills.filter(skill => 
    !requiredSkills.includes(skill) && 
    (preferredSection.toLowerCase().includes(skill.toLowerCase()) || 
     /\b(?:preferred|nice to have|bonus|helpful|advantage)\b/i.test(preferredSection))
  );

  // If parsing didn't work, fall back to simple division
  const required = requiredSkills.length > 0 ? requiredSkills : allSkills.slice(0, Math.ceil(allSkills.length * 0.6));
  const preferred = preferredSkills.length > 0 ? preferredSkills : allSkills.slice(required.length, required.length + 4);

  // Extract education and experience requirements
  const educationMatch = text.match(/(?:education|degree|bachelor|master|phd)[:\s]*([^.;\n]+)/i);
  const experienceMatch = text.match(/(?:experience|\d+\s*(?:years?|yrs?))[:\s]*([^.;\n]+)/i);

  return {
    jdId: uuidv4(),
    title: jdInput.title || 'Target Role',
    company: jdInput.company || 'Company Not Specified',
    requiredSkills: required,
    preferredSkills: preferred,
    educationRequirement: educationMatch?.[1]?.trim() || 'Not specified',
    experienceRequirement: experienceMatch?.[1]?.trim() || 'Not specified',
    responsibilities: text.match(/(?:responsibilities?|duties)[:\s]*([^]*?)(?:requirements|qualifications|$)/i)?.[1]?.split(/[.;\n]/).filter(Boolean).slice(0, 8) || text.split(/[.;\n]/).filter(Boolean).slice(0, 8),
    rawText: text,
  };
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'CareerMatch AI API', timestamp: new Date().toISOString() });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  const existing = users.get(String(email).toLowerCase());
  if (existing) {
    return res.status(409).json({ message: 'User already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: uuidv4(),
    name,
    email: String(email).toLowerCase(),
    passwordHash,
  };

  users.set(user.email, user);

  return res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email },
    token: createToken(user)
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = users.get(String(email).toLowerCase());
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  return res.json({
    user: { id: user.id, name: user.name, email: user.email },
    token: createToken(user)
  });
});

app.post('/api/resumes/upload', authMiddleware, (req, res) => {
  const { resumeText, candidateName, targetRole } = req.body || {};

  if (!resumeText) {
    return res.status(400).json({ message: 'Resume text is required.' });
  }

  const resumeId = uuidv4();
  const parsedProfile = inferStructureFromResume(resumeText);
  const resumeRecord = {
    id: resumeId,
    userId: req.user.id,
    candidateName: candidateName || parsedProfile.candidateName,
    targetRole: targetRole || 'Target Role',
    parsedProfile,
    createdAt: new Date().toISOString(),
  };

  resumes.set(resumeId, resumeRecord);

  return res.status(201).json({ message: 'Resume uploaded successfully.', resumeId, parsedProfile });
});

app.post('/api/jd/analyze', authMiddleware, (req, res) => {
  const { title, company, text } = req.body || {};

  if (!text) {
    return res.status(400).json({ message: 'Job description text is required.' });
  }

  const jdProfile = buildJdProfile({ title, company, text });
  jds.set(jdProfile.jdId, jdProfile);

  return res.json({
    message: 'JD analyzed successfully.',
    jdId: jdProfile.jdId,
    title: jdProfile.title,
    company: jdProfile.company,
    requiredSkills: jdProfile.requiredSkills,
    preferredSkills: jdProfile.preferredSkills,
    responsibilities: jdProfile.responsibilities,
  });
});

app.post('/api/match', authMiddleware, (req, res) => {
  const { resumeId, jdId } = req.body || {};

  if (!resumeId || !jdId) {
    return res.status(400).json({ message: 'Both resumeId and jdId are required.' });
  }

  const resume = resumes.get(resumeId);
  const jd = jds.get(jdId);

  if (!resume || !jd) {
    return res.status(404).json({ message: 'Resume or job description not found.' });
  }

  const result = calculateMatchScore(resume.parsedProfile, jd);
  const matchId = uuidv4();

  matches.set(matchId, {
    id: matchId,
    userId: req.user.id,
    resumeId,
    jdId,
    ...result,
    createdAt: new Date().toISOString(),
  });

  return res.json({
    matchId,
    overallScore: result.overallScore,
    readiness: result.readiness,
    strengths: result.strengths,
    gaps: result.gaps,
    matchedPreferred: result.matchedPreferred,
    scoringBreakdown: result.scoringBreakdown,
    recommendations: result.recommendations,
  });
});

app.get('/api/dashboard', authMiddleware, (req, res) => {
  const userResumes = Array.from(resumes.values()).filter((resume) => resume.userId === req.user.id);
  const latestResume = userResumes[userResumes.length - 1];
  const summary = {
    resumeHealth: latestResume ? 'Strong' : 'No resume uploaded yet',
    selectedRole: latestResume?.targetRole || 'Not set',
    criticalSkillGaps: latestResume ? ['sql', 'aws'] : [],
    interviewReadiness: 82,
    roadmapProgress: 40,
    totalResumes: userResumes.length,
  };

  return res.json(summary);
});

app.post('/api/skill-gap-analysis', authMiddleware, (req, res) => {
  const { matchId } = req.body || {};

  if (!matchId) {
    return res.status(400).json({ message: 'matchId is required.' });
  }

  const match = matches.get(matchId);
  if (!match || match.userId !== req.user.id) {
    return res.status(404).json({ message: 'Match not found.' });
  }

  const resume = resumes.get(match.resumeId);
  const jd = jds.get(match.jdId);

  if (!resume || !jd) {
    return res.status(404).json({ message: 'Resume or job description not found.' });
  }

  const gaps = match.gaps || [];
  const roadmap = gaps.map((skill, index) => ({
    skill,
    priority: index < 2 ? 'Critical' : index < 4 ? 'High' : 'Medium',
    estimatedWeeks: (index + 1) * 2,
    resources: [
      `Free online course: ${skill.toUpperCase()} Fundamentals`,
      `Udemy or Coursera course in ${skill}`,
      `Official ${skill} documentation and tutorials`,
      `GitHub projects using ${skill}`,
      `Local meetup or community group`,
    ],
    practiceProjects: [
      `Build a small project using ${skill}`,
      `Contribute to open-source projects using ${skill}`,
      `Create a portfolio project highlighting ${skill}`,
    ]
  }));

  return res.json({
    matchId,
    totalGaps: gaps.length,
    criticalSkills: gaps.slice(0, 2),
    improvementRoadmap: roadmap,
    estimatedTimeToReady: roadmap.reduce((sum, item) => sum + item.estimatedWeeks, 0) + ' weeks',
    nextSteps: [
      `Start with: ${gaps[0]}`,
      'Practice with real projects',
      'Update resume with new skills',
      'Re-evaluate match score after improvement'
    ]
  });
});

// GET /api/resumes — list user's resumes
app.get('/api/resumes', authMiddleware, (req, res) => {
  const userResumes = Array.from(resumes.values())
    .filter(r => r.userId === req.user.id)
    .map(r => ({ id: r.id, candidateName: r.candidateName, targetRole: r.targetRole, createdAt: r.createdAt, skillCount: r.parsedProfile?.skills?.length || 0 }));
  return res.json({ resumes: userResumes });
});

// POST /api/interview/start — generate interview questions from a match
app.post('/api/interview/start', authMiddleware, (req, res) => {
  const { matchId } = req.body || {};
  const match = matchId ? matches.get(matchId) : null;
  const sessionId = uuidv4();

  const strengths = match?.strengths || [];
  const gaps = match?.gaps || [];

  const questions = [
    { id: 'q1', category: 'HR', question: 'Tell me about yourself and your background.', hint: 'Cover education, skills, and motivation.' },
    { id: 'q2', category: 'Technical', question: strengths[0] ? `Walk me through a project where you used ${strengths[0]}.` : 'Describe a technical project you are proud of.', hint: 'Use STAR method.' },
    { id: 'q3', category: 'Technical', question: gaps[0] ? `This role requires ${gaps[0]}. How do you plan to close that gap?` : 'How do you approach learning a new technology?', hint: 'Be specific about your learning plan.' },
    { id: 'q4', category: 'Behavioral', question: 'Describe a time you handled a challenging deadline.', hint: 'Focus on prioritization and outcome.' },
    { id: 'q5', category: 'Technical', question: 'How would you explain a machine learning model to a non-technical stakeholder?', hint: 'Think business impact, not math.' },
    { id: 'q6', category: 'HR', question: 'Where do you see yourself in 3 years?', hint: 'Align with role growth.' },
    { id: 'q7', category: 'Behavioral', question: 'Tell me about a time you made a mistake and how you handled it.', hint: 'Show accountability and growth.' },
    { id: 'q8', category: 'Resume-Specific', question: 'Walk me through your most technically challenging project.', hint: 'Highlight problem, approach, tools, outcomes.' },
  ];

  const session = { sessionId, userId: req.user.id, matchId, questions, answers: [], scores: [], createdAt: new Date().toISOString() };
  interviewSessions.set(sessionId, session);

  return res.json({ sessionId, questionCount: questions.length, questions });
});

// POST /api/interview/answer — evaluate a candidate's answer
app.post('/api/interview/answer', authMiddleware, (req, res) => {
  const { sessionId, questionId, answer } = req.body || {};
  if (!answer) return res.status(400).json({ message: 'Answer is required.' });

  const wordCount = String(answer).trim().split(/\s+/).length;
  const hasNumbers = /\d+/.test(answer);
  const hasAction = /\b(built|created|developed|implemented|designed|improved|achieved|reduced|increased)\b/i.test(answer);
  const isLong = wordCount >= 50;

  let score = 40;
  const feedback = [];
  if (isLong) { score += 20; } else { feedback.push('Try to provide a more detailed answer (aim for 50+ words).'); }
  if (hasNumbers) { score += 15; feedback.push('Good use of specific numbers or metrics.'); }
  if (hasAction) { score += 15; feedback.push('Strong action verbs detected.'); }
  if (/result|outcome|impact/i.test(answer)) { score += 10; feedback.push('You mentioned results — excellent!'); }
  if (feedback.length === 0) feedback.push('Add specific examples and measurable outcomes.');
  score = Math.min(100, score);

  const level = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Work';

  // Update session
  const session = sessionId ? interviewSessions.get(sessionId) : null;
  if (session) {
    session.answers.push({ questionId, answer });
    session.scores.push(score);
    interviewSessions.set(sessionId, session);
  }

  return res.json({ score, level, feedback, wordCount });
});

// GET /api/applications — list user applications
app.get('/api/applications', authMiddleware, (req, res) => {
  const userApps = Array.from(applications.values()).filter(a => a.userId === req.user.id);
  return res.json(userApps);
});

// POST /api/applications — add new application
app.post('/api/applications', authMiddleware, (req, res) => {
  const { company, role, status, notes, appliedAt } = req.body || {};
  if (!company || !role) return res.status(400).json({ message: 'Company and role are required.' });
  const app_ = { id: uuidv4(), userId: req.user.id, company, role, status: status || 'Applied', notes: notes || '', appliedAt: appliedAt || new Date().toISOString() };
  applications.set(app_.id, app_);
  return res.status(201).json(app_);
});

// PATCH /api/applications/:id — update application status
app.patch('/api/applications/:id', authMiddleware, (req, res) => {
  const app_ = applications.get(req.params.id);
  if (!app_ || app_.userId !== req.user.id) return res.status(404).json({ message: 'Application not found.' });
  app_.status = req.body.status || app_.status;
  applications.set(app_.id, app_);
  return res.json(app_);
});

// PATCH /api/roadmap/progress — update skill learning progress
app.patch('/api/roadmap/progress', authMiddleware, (req, res) => {
  const { skill, status } = req.body || {};
  if (!skill || !status) return res.status(400).json({ message: 'skill and status are required.' });
  const key = `${req.user.id}:${skill}`;
  roadmapProgress.set(key, { userId: req.user.id, skill, status, updatedAt: new Date().toISOString() });
  return res.json({ skill, status, message: 'Progress updated.' });
});

module.exports = { app, createApp: () => app, PORT };

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CareerMatch AI server listening on port ${PORT}`);
  });
}
