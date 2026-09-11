function normalizeSkill(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9+\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildResumeSuggestions(resumeProfile = {}, jdProfile = {}) {
  const resumeSkills = new Set((resumeProfile.skills || []).map(normalizeSkill));
  const requiredSkills = jdProfile.requiredSkills || [];
  const preferredSkills = jdProfile.preferredSkills || [];
  const evidenceBySkill = new Map((resumeProfile.skillEvidence || []).map((item) => [normalizeSkill(item.skill), item]));
  const suggestions = [];

  requiredSkills.forEach((skill) => {
    const key = normalizeSkill(skill);
    const evidence = evidenceBySkill.get(key);
    if (!resumeSkills.has(key)) {
      suggestions.push({
        category: 'JD alignment',
        label: 'SUGGESTED - VERIFY BEFORE USING',
        requirementType: 'REQUIRED',
        skill,
        message: `The target role requires ${skill}, but your resume does not currently show supporting evidence. Add it only if you genuinely have this experience.`,
        action: `If accurate, add a project, experience bullet, or certification that demonstrates ${skill}.`,
      });
    } else if (evidence?.evidenceLevel === 'WEAK') {
      suggestions.push({
        category: 'Evidence strength',
        label: 'SUGGESTED - VERIFY BEFORE USING',
        requirementType: 'REQUIRED',
        skill,
        message: `${skill} appears in your resume, but the supporting evidence is weak or vague.`,
        action: `Replace the vague mention with a truthful description of how you used ${skill}.`,
      });
    } else {
      suggestions.push({
        category: 'Resume strength',
        label: 'BASED ON YOUR RESUME',
        requirementType: 'REQUIRED',
        skill,
        message: `Your resume demonstrates ${skill}, which directly aligns with a required job skill.`,
        action: `Keep the strongest ${skill} evidence visible near your summary, skills, or most relevant project.`,
      });
    }
  });

  preferredSkills.forEach((skill) => {
    const key = normalizeSkill(skill);
    if (!resumeSkills.has(key)) {
      suggestions.push({
        category: 'Optional alignment',
        label: 'SUGGESTED - VERIFY BEFORE USING',
        requirementType: 'PREFERRED',
        skill,
        message: `${skill} is preferred for this role but is not evidenced in your resume.`,
        action: `Add ${skill} only if you have genuine project, coursework, certification, or work evidence.`,
      });
    }
  });

  return {
    truthGuard: 'Suggestions never create unsupported experience, achievements, certifications, or projects.',
    suggestions,
    summary: {
      requiredCovered: requiredSkills.filter((skill) => resumeSkills.has(normalizeSkill(skill))).length,
      requiredTotal: requiredSkills.length,
      preferredCovered: preferredSkills.filter((skill) => resumeSkills.has(normalizeSkill(skill))).length,
      preferredTotal: preferredSkills.length,
    },
  };
}

module.exports = { buildResumeSuggestions };
