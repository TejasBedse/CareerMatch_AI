const EVIDENCE_LEVELS = Object.freeze({
  STRONG: 'STRONG',
  MODERATE: 'MODERATE',
  WEAK: 'WEAK',
  MISSING: 'MISSING',
});

const SOURCE_PATTERNS = [
  { source: 'Project', pattern: /project|built|developed|implemented|dashboard|model|pipeline|application/i },
  { source: 'Experience', pattern: /experience|internship|worked|role|employment|responsibilit|year[s]?\s+(?:of\s+)?hands-on/i },
  { source: 'Certification', pattern: /certif|credential|coursework|training/i },
];

function normalizeSkill(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9+\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findSkillReferences(skill, resumeText) {
  const normalizedSkill = normalizeSkill(skill);
  const lines = String(resumeText || '')
    .split(/\r?\n|[.!?]+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.filter((line) => normalizeSkill(line).includes(normalizedSkill));
}

function classifyEvidence(references) {
  if (!references.length) {
    return {
      level: EVIDENCE_LEVELS.MISSING,
      source: '-',
      confidence: 0,
    };
  }

  const sources = references.map((reference) => {
    return SOURCE_PATTERNS.find(({ pattern }) => pattern.test(reference))?.source || 'Resume';
  });
  const distinctSources = new Set(sources);
  const hasProject = distinctSources.has('Project');
  const hasExperience = distinctSources.has('Experience');
  const primarySource = hasProject
    ? 'Project'
    : hasExperience
      ? 'Experience'
      : sources[0];

  const weakReference = references.findIndex((reference) => /basic|mention|familiar|exposure/i.test(reference));
  if (weakReference >= 0 && references.length <= 2) {
    return { level: EVIDENCE_LEVELS.WEAK, source: sources[weakReference], confidence: 0.55 };
  }

  if ((hasProject && hasExperience) || references.length >= 3) {
    return { level: EVIDENCE_LEVELS.STRONG, source: sources.slice(0, 2).join(' + '), confidence: 0.95 };
  }

  if (hasProject || hasExperience || references.length >= 2) {
    return { level: EVIDENCE_LEVELS.MODERATE, source: primarySource, confidence: 0.8 };
  }

  return { level: EVIDENCE_LEVELS.WEAK, source: sources[0], confidence: 0.55 };
}

function analyzeSkillEvidence(skills = [], resumeText = '') {
  return skills.map((skill) => {
    const references = findSkillReferences(skill, resumeText);
    const classification = classifyEvidence(references);
    return {
      skill: String(skill),
      presence: references.length > 0,
      evidenceLevel: classification.level,
      evidenceSource: classification.source,
      evidenceText: references.slice(0, 3).join(' | ') || 'No supporting project, experience, or certification evidence found.',
      confidence: classification.confidence,
      references,
    };
  });
}

module.exports = { EVIDENCE_LEVELS, analyzeSkillEvidence };
