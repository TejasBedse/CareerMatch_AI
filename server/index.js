const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { v4: uuidv4 } = require('uuid');
const { calculateMatchScore } = require('./services/matchingService');
const { analyzeSkillEvidence } = require('./services/evidenceService');
const { buildGapRoadmap } = require('./services/roadmapService');
const { buildResumeSuggestions } = require('./services/resumeService');
const { buildInterviewQuestions, evaluateInterviewAnswer, selectAdaptiveQuestion } = require('./services/interviewService');
const { calculateCareerReadiness } = require('./services/readinessService');
const { compareJobs } = require('./services/comparisonService');
const { recognizeImage } = require('./services/ocrService');
const { getProviderStatus, analyzeResumeWithGemini, analyzeJDWithGemini, ai } = require('./services/aiService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'careermatch-dev-secret';

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
const configuredOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const corsOrigins = new Set([...allowedOrigins, ...configuredOrigins]);

function isAllowedOrigin(origin) {
  if (!origin || corsOrigins.has(origin)) return true;

  try {
    const parsedOrigin = new URL(origin);
    return parsedOrigin.protocol === 'https:' && parsedOrigin.hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.options('*', cors());
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/octet-stream',
      'image/png',
      'image/jpeg',
      'image/jpg',
    ];
    const extension = String(file.originalname || '').toLowerCase();
    const isTextFile = extension.endsWith('.txt');
    const isPdf = extension.endsWith('.pdf');
    const isDocx = extension.endsWith('.docx');
    const isDoc = extension.endsWith('.doc');

    if (allowed.includes(file.mimetype) || isTextFile || isPdf || isDocx || isDoc) {
      cb(null, true);
      return;
    }

    cb(new Error('Unsupported file type. Please upload a PDF, DOCX, DOC or TXT file.'));
  },
});

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
  const token = tokenFromHeader;

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

async function extractTextFromUploadedFile(file) {
  if (!file || !file.buffer) {
    throw new Error('Resume file is required.');
  }

  const fileName = String(file.originalname || '').toLowerCase();
  const mimeType = String(file.mimetype || '').toLowerCase();

  if (mimeType.includes('pdf') || fileName.endsWith('.pdf')) {
    const data = await pdfParse(file.buffer);
    if (data.text?.trim()) return { text: data.text, warning: '' };
    return recognizeImage(file.buffer);
  }

  if (mimeType.includes('word') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return { text: result.value || '', warning: '' };
  }

  if (mimeType.includes('text') || fileName.endsWith('.txt')) {
    return { text: file.buffer.toString('utf8'), warning: '' };
  }

  if (mimeType.startsWith('image/') || /\.(png|jpe?g)$/i.test(fileName)) {
    return recognizeImage(file.buffer);
  }

  throw new Error('Unsupported file type. Please upload a PDF, DOCX, DOC, or TXT file.');
}

async function createResumeRecord({ userId, candidateName, targetRole, resumeText, extractionWarning = '' }) {
  let parsedProfile;
  if (ai) {
    parsedProfile = await analyzeResumeWithGemini(resumeText);
  }
  
  if (!parsedProfile || !parsedProfile.skills) {
    parsedProfile = inferStructureFromResume(resumeText);
  } else {
    parsedProfile.candidateName = parsedProfile.candidateName || candidateName || 'Candidate';
    parsedProfile.skills = parsedProfile.skills.map(s => normalizeSkillValue(s)) || [];
    parsedProfile.education = parsedProfile.education || 'Education details not specified';
    parsedProfile.experience = parsedProfile.experience || 'Experience details not specified';
    parsedProfile.summary = parsedProfile.summary || 'No summary provided';
  }

  parsedProfile.skillEvidence = analyzeSkillEvidence(parsedProfile.skills, resumeText);
  const resumeId = uuidv4();
  const resumeRecord = {
    id: resumeId,
    userId,
    candidateName: candidateName || parsedProfile.candidateName,
    targetRole: targetRole || 'Target Role',
    parsedProfile,
    extractionWarning,
    createdAt: new Date().toISOString(),
  };

  resumes.set(resumeId, resumeRecord);
  return {
    resumeId,
    candidateName: resumeRecord.candidateName,
    targetRole: resumeRecord.targetRole,
    parsedProfile,
    extractionWarning: resumeRecord.extractionWarning,
  };
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

async function buildJdProfileAsync(jdInput) {
  let jdProfile;
  if (ai) {
    jdProfile = await analyzeJDWithGemini(jdInput.text);
  }
  
  if (!jdProfile || !jdProfile.requiredSkills) {
    return buildJdProfile(jdInput);
  }
  
  return {
    jdId: uuidv4(),
    title: jdInput.title || 'Target Role',
    company: jdInput.company || 'Company Not Specified',
    requiredSkills: jdProfile.requiredSkills.map(s => normalizeSkillValue(s)) || [],
    preferredSkills: jdProfile.preferredSkills.map(s => normalizeSkillValue(s)) || [],
    educationRequirement: jdProfile.educationRequirement || 'Not specified',
    experienceRequirement: jdProfile.experienceRequirement || 'Not specified',
    responsibilities: jdProfile.responsibilities || [],
    rawText: jdInput.text,
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

app.post('/api/resumes/upload', authMiddleware, async (req, res) => {
  const { resumeText, candidateName, targetRole } = req.body || {};
  const resolvedName = candidateName && String(candidateName).trim()
    ? String(candidateName).trim()
    : (req.user && req.user.email ? (users.get(String(req.user.email).toLowerCase())?.name || 'Candidate') : 'Candidate');

  if (!targetRole || !String(targetRole).trim()) {
    return res.status(400).json({ message: 'Target role is required.' });
  }

  if (!resolvedName || !String(resolvedName).trim()) {
    return res.status(400).json({ message: 'Candidate name is required.' });
  }

  if (!resumeText) {
    return res.status(400).json({ message: 'Resume text is required.' });
  }

  const result = await createResumeRecord({
    userId: req.user.id,
    candidateName: resolvedName,
    targetRole: String(targetRole).trim(),
    resumeText,
  });

  return res.status(201).json({ message: 'Resume uploaded successfully.', ...result });
});

app.post('/api/resumes/upload-file', authMiddleware, upload.single('resumeFile'), async (req, res) => {
  try {
    const candidateName = req.body?.candidateName && String(req.body.candidateName).trim()
      ? String(req.body.candidateName).trim()
      : (req.user && req.user.email ? (users.get(String(req.user.email).toLowerCase())?.name || 'Candidate') : 'Candidate');
    const targetRole = req.body?.targetRole && String(req.body.targetRole).trim() ? String(req.body.targetRole).trim() : '';

    if (!candidateName || !String(candidateName).trim()) {
      return res.status(400).json({ message: 'Candidate name is required.' });
    }

    if (!targetRole) {
      return res.status(400).json({ message: 'Target role is required.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please select a resume file to upload.' });
    }

    const extraction = await extractTextFromUploadedFile(req.file);
    if (!extraction.text || !extraction.text.trim()) {
      return res.status(400).json({ message: 'The uploaded file did not contain readable resume text.' });
    }

    const result = await createResumeRecord({
      userId: req.user.id,
      candidateName,
      targetRole,
      resumeText: extraction.text,
      extractionWarning: extraction.warning,
    });

    return res.status(201).json({ message: 'Resume file uploaded successfully.', ...result });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Unable to process uploaded resume file.' });
  }
});

// POST /api/resume-ai/suggestions - generate JD-specific, truth-guarded suggestions
app.post('/api/resume-ai/suggestions', authMiddleware, (req, res) => {
  const { resumeId, jdId } = req.body || {};
  const resume = resumes.get(resumeId);
  const jd = jds.get(jdId);

  if (!resume || resume.userId !== req.user.id || !jd || jd.userId !== req.user.id) {
    return res.status(404).json({ message: 'Resume or job description not found.' });
  }

  return res.json({
    resumeId,
    jdId,
    ...buildResumeSuggestions(resume.parsedProfile, jd),
  });
});

app.post('/api/jd/analyze', authMiddleware, async (req, res) => {
  const { title, company, text } = req.body || {};

  if (!text) {
    return res.status(400).json({ message: 'Job description text is required.' });
  }

  const jdProfile = await buildJdProfileAsync({ title, company, text });
  jdProfile.userId = req.user.id;
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

app.get('/api/jobs', authMiddleware, (req, res) => {
  const jobs = Array.from(jds.values())
    .filter((job) => job.userId === req.user.id)
    .map(({ jdId, title, company, requiredSkills, preferredSkills, responsibilities }) => ({
      jdId, title, company, requiredSkills, preferredSkills, responsibilities,
    }));
  return res.json({ jobs });
});

app.post('/api/matches/compare', authMiddleware, (req, res) => {
  const { resumeId, jdIds } = req.body || {};
  if (!resumeId || !Array.isArray(jdIds) || jdIds.length < 2) {
    return res.status(400).json({ message: 'resumeId and at least two jdIds are required.' });
  }
  const resume = resumes.get(resumeId);
  const jobs = jdIds.map((jdId) => jds.get(jdId));
  if (!resume || resume.userId !== req.user.id || jobs.some((job) => !job || job.userId !== req.user.id)) {
    return res.status(404).json({ message: 'Resume or job description not found.' });
  }
  return res.json({ resumeId, comparisons: compareJobs({ resume, jobs, calculateMatch: calculateMatchScore }) });
});

app.post('/api/match', authMiddleware, (req, res) => {
  const { resumeId, jdId } = req.body || {};

  if (!resumeId || !jdId) {
    return res.status(400).json({ message: 'Both resumeId and jdId are required.' });
  }

  const resume = resumes.get(resumeId);
  const jd = jds.get(jdId);

  if (!resume || !jd || resume.userId !== req.user.id || jd.userId !== req.user.id) {
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
    preferredGaps: result.preferredGaps,
    skillEvidence: resume.parsedProfile.skillEvidence || [],
    weights: result.weights,
    factorScores: result.factorScores,
    contributions: result.contributions,
    scoringBreakdown: result.scoringBreakdown,
    explanation: result.explanation,
    recommendations: result.recommendations,
  });
});

app.get('/api/dashboard', authMiddleware, (req, res) => {
  const userResumes = Array.from(resumes.values()).filter((resume) => resume.userId === req.user.id);
  const latestResume = userResumes[userResumes.length - 1];
  const latestMatch = Array.from(matches.values()).filter((match) => match.userId === req.user.id).pop();
  const userInterviewSessions = Array.from(interviewSessions.values()).filter((session) => session.userId === req.user.id);
  const userRoadmapItems = Array.from(roadmapProgress.values()).filter((item) => item.userId === req.user.id);
  const readiness = calculateCareerReadiness({
    resume: latestResume,
    match: latestMatch,
    interviewSessions: userInterviewSessions,
    roadmapItems: userRoadmapItems,
  });
  const summary = {
    resumeHealth: latestResume ? 'Strong' : 'No resume uploaded yet',
    selectedRole: latestResume?.targetRole || 'Not set',
    criticalSkillGaps: latestResume ? ['sql', 'aws'] : [],
    interviewReadiness: readiness.interviewReadiness,
    roadmapProgress: readiness.roadmapProgress,
    ...readiness,
    totalResumes: userResumes.length,
    profile: {
      name: latestResume?.candidateName || users.get(req.user.email)?.name || 'Candidate',
      email: users.get(req.user.email)?.email || req.user.email,
      targetRole: latestResume?.targetRole || 'Target role not set',
      skills: latestResume?.parsedProfile?.skills || [],
      education: latestResume?.parsedProfile?.education || 'Upload a resume to extract education',
      experience: latestResume?.parsedProfile?.experience || 'Upload a resume to extract experience',
    },
  };

  return res.json(summary);
});

app.get('/api/readiness', authMiddleware, (req, res) => {
  const latestResume = Array.from(resumes.values()).filter((resume) => resume.userId === req.user.id).pop();
  const latestMatch = Array.from(matches.values()).filter((match) => match.userId === req.user.id).pop();
  return res.json(calculateCareerReadiness({
    resume: latestResume,
    match: latestMatch,
    interviewSessions: Array.from(interviewSessions.values()).filter((session) => session.userId === req.user.id),
    roadmapItems: Array.from(roadmapProgress.values()).filter((item) => item.userId === req.user.id),
  }));
});

app.get('/api/ai/status', authMiddleware, (req, res) => {
  return res.json(getProviderStatus());
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

  const gaps = [...(match.gaps || []), ...(match.preferredGaps || [])];
  const roadmap = buildGapRoadmap({
    requiredGaps: match.gaps || [],
    preferredGaps: match.preferredGaps || [],
    responsibilities: jd.responsibilities || [],
    skillEvidence: resume.parsedProfile.skillEvidence || [],
  });

  return res.json({
    matchId,
    totalGaps: gaps.length,
    criticalSkills: roadmap.filter((item) => item.priority === 'Critical').map((item) => item.skill),
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

// GET /api/resumes/:id/evidence - inspect the evidence supporting extracted skills
app.get('/api/resumes/:id/evidence', authMiddleware, (req, res) => {
  const resume = resumes.get(req.params.id);
  if (!resume || resume.userId !== req.user.id) {
    return res.status(404).json({ message: 'Resume not found.' });
  }

  return res.json({
    resumeId: resume.id,
    targetRole: resume.targetRole,
    skillEvidence: resume.parsedProfile.skillEvidence || [],
  });
});

// POST /api/interview/start — generate interview questions from a match
app.post('/api/interview/start', authMiddleware, (req, res) => {
  const { matchId } = req.body || {};
  const match = matchId ? matches.get(matchId) : null;
  if (match && match.userId !== req.user.id) return res.status(404).json({ message: 'Match not found.' });
  const resume = match ? resumes.get(match.resumeId) : null;
  const jd = match ? jds.get(match.jdId) : null;
  const questions = buildInterviewQuestions({
    strengths: match?.strengths || [],
    gaps: [...(match?.gaps || []), ...(match?.preferredGaps || [])],
    skillEvidence: resume?.parsedProfile?.skillEvidence || [],
    targetRole: resume?.targetRole || jd?.title || 'this role',
  });
  const sessionId = uuidv4();
  const session = { sessionId, userId: req.user.id, matchId, questions, answers: [], scores: [], weaknesses: [], createdAt: new Date().toISOString() };
  interviewSessions.set(sessionId, session);

  return res.json({ sessionId, questionCount: questions.length, questions });
});

// POST /api/interview/answer — evaluate a candidate's answer
app.post('/api/interview/answer', authMiddleware, (req, res) => {
  const { sessionId, questionId, answer } = req.body || {};
  if (!answer) return res.status(400).json({ message: 'Answer is required.' });

  const session = sessionId ? interviewSessions.get(sessionId) : null;
  if (!session || session.userId !== req.user.id) return res.status(404).json({ message: 'Interview session not found.' });
  const question = session.questions.find((item) => item.id === questionId) || {};
  const evaluation = evaluateInterviewAnswer(answer, question);
  session.answers.push({ questionId, answer });
  session.scores.push(evaluation.score);
  session.weaknesses.push(evaluation.weakestArea);
  const nextQuestion = selectAdaptiveQuestion(session.questions, session.answers.map((item) => item.questionId), evaluation.weakestArea);
  interviewSessions.set(sessionId, session);

  return res.json({ ...evaluation, nextQuestion, readinessScore: Math.round(session.scores.reduce((sum, score) => sum + score, 0) / session.scores.length) });
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
