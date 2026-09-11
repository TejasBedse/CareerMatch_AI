const EAMS_WEIGHTS = Object.freeze({
  skillMatch: 0.30,
  semanticMatch: 0.30,
  experience: 0.15,
  projectEvidence: 0.15,
  requirementImportance: 0.10,
});

function normalizeSkill(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9+\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function uniqueSkills(skills = []) {
  return Array.from(new Set(skills.map(normalizeSkill).filter(Boolean)));
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function coverage(requiredSkills, resumeSkills) {
  if (!requiredSkills.length) return 100;
  return (requiredSkills.filter((skill) => resumeSkills.has(normalizeSkill(skill))).length / requiredSkills.length) * 100;
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
    recommendations.push('Consider gaining more experience with the core tech stack before applying.');
  }

  recommendations.push('Tailor your resume description to match JD terminology and priorities.');
  return recommendations.slice(0, 4);
}

function calculateSemanticMatch(resumeProfile, jdProfile, requiredCoverage) {
  const resumeText = [
    resumeProfile.summary,
    resumeProfile.experience,
    resumeProfile.education,
    ...(resumeProfile.skills || []),
  ].join(' ').toLowerCase();
  const jdText = [
    jdProfile.title,
    jdProfile.text,
    ...(jdProfile.responsibilities || []),
  ].join(' ').toLowerCase();
  const sharedTerms = uniqueSkills(jdText.split(/[^a-z0-9+.-]+/)).filter((term) => resumeText.includes(term));
  const lexicalSignal = Math.min(5, sharedTerms.length);
  return clampScore(Math.min(100, 65 + (requiredCoverage * 0.2) + lexicalSignal));
}

function calculateEvidenceScore(resumeProfile, matchedRequired, matchedPreferred) {
  const resumeText = [resumeProfile.summary, resumeProfile.experience, ...(resumeProfile.skills || [])]
    .join(' ')
    .toLowerCase();
  const projectSignal = /project|built|developed|implemented|dashboard|model|pipeline/i.test(resumeText);
  const experienceSignal = /experience|internship|worked|role|developer|analyst/i.test(resumeText);
  const requiredEvidence = matchedRequired.length ? 55 : 35;
  const projectEvidence = projectSignal ? 15 : 0;
  const experienceEvidence = experienceSignal ? 10 : 0;
  return clampScore(requiredEvidence + projectEvidence + experienceEvidence);
}

function calculateMatchScore(resumeProfile = {}, jdProfile = {}, options = {}) {
  const weights = { ...EAMS_WEIGHTS, ...(options.weights || {}) };
  const resumeSkills = new Set(uniqueSkills(resumeProfile.skills));
  const requiredSkills = uniqueSkills(jdProfile.requiredSkills);
  const preferredSkills = uniqueSkills(jdProfile.preferredSkills);
  const matchedRequired = requiredSkills.filter((skill) => resumeSkills.has(skill));
  const gappedRequired = requiredSkills.filter((skill) => !resumeSkills.has(skill));
  const matchedPreferred = preferredSkills.filter((skill) => resumeSkills.has(skill));
  const gappedPreferred = preferredSkills.filter((skill) => !resumeSkills.has(skill));

  const requiredCoverage = coverage(requiredSkills, resumeSkills);
  const preferredCoverage = coverage(preferredSkills, resumeSkills);
  const skillMatch = requiredSkills.length || preferredSkills.length
    ? (requiredCoverage * 0.7) + (preferredCoverage * 0.3)
    : 100;
  const semanticMatch = calculateSemanticMatch(resumeProfile, jdProfile, requiredCoverage);
  const experience = resumeProfile.experience && !/not specified/i.test(resumeProfile.experience) ? 70 : 40;
  const projectEvidence = calculateEvidenceScore(resumeProfile, matchedRequired, matchedPreferred);
  const requirementImportance = requiredSkills.length
    ? (requiredCoverage * 0.8) + (preferredCoverage * 0.2)
    : 100;

  const factorScores = {
    skillMatch: clampScore(skillMatch),
    semanticMatch,
    experience,
    projectEvidence,
    requirementImportance: clampScore(requirementImportance),
  };
  const contributions = Object.fromEntries(
    Object.entries(weights).map(([factor, weight]) => [factor, Number((factorScores[factor] * weight).toFixed(2))]),
  );
  const overallScore = clampScore(Object.values(contributions).reduce((total, contribution) => total + contribution, 0));

  return {
    overallScore,
    weights,
    factorScores,
    contributions,
    strengths: [...matchedRequired, ...matchedPreferred].slice(0, 5),
    gaps: gappedRequired.slice(0, 5),
    matchedPreferred: matchedPreferred.slice(0, 3),
    preferredGaps: gappedPreferred.slice(0, 5),
    scoringBreakdown: {
      requiredSkills: factorScores.skillMatch,
      preferredSkills: clampScore(preferredCoverage),
      semanticMatch: factorScores.semanticMatch,
      experienceAlignment: factorScores.experience,
      projectEvidence: factorScores.projectEvidence,
      requirementImportance: factorScores.requirementImportance,
    },
    explanation: `CareerMatch Score is calculated from skill match (${factorScores.skillMatch}%), semantic match (${factorScores.semanticMatch}%), experience (${factorScores.experience}%), project evidence (${factorScores.projectEvidence}%), and requirement importance (${factorScores.requirementImportance}%).`,
    readiness: overallScore >= 80 ? 'Ready to Apply' : overallScore >= 60 ? 'Good Fit - Minor Gaps' : overallScore >= 40 ? 'Possible Fit - Notable Gaps' : 'Not a Strong Match',
    recommendations: generateRecommendations(gappedRequired, [...matchedRequired, ...matchedPreferred], overallScore),
  };
}

module.exports = { EAMS_WEIGHTS, calculateMatchScore };
