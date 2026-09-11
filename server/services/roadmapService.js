const PRIORITY_RANK = Object.freeze({ Critical: 0, High: 1, Medium: 2, Low: 3 });

function normalizeSkill(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9+\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getEvidence(skill, evidence = []) {
  return evidence.find((item) => normalizeSkill(item.skill) === normalizeSkill(skill));
}

function priorityFor({ required, evidenceLevel, responsibilityMention }) {
  if (required && evidenceLevel === 'MISSING' && !responsibilityMention) return 'Critical';
  if (required || responsibilityMention) return 'High';
  if (evidenceLevel === 'WEAK') return 'Medium';
  return 'Low';
}

function buildGapRoadmap({ requiredGaps = [], preferredGaps = [], responsibilities = [], skillEvidence = [] }) {
  const responsibilityText = responsibilities.join(' ').toLowerCase();
  const uniqueGaps = new Map();

  [...requiredGaps.map((skill) => ({ skill, required: true })), ...preferredGaps.map((skill) => ({ skill, required: false }))]
    .forEach(({ skill, required }) => {
      const key = normalizeSkill(skill);
      if (!key || uniqueGaps.has(key)) return;
      const evidence = getEvidence(skill, skillEvidence);
      const responsibilityMention = responsibilityText.includes(key);
      const priority = priorityFor({
        required,
        evidenceLevel: evidence?.evidenceLevel || 'MISSING',
        responsibilityMention,
      });

      uniqueGaps.set(key, {
        skill,
        priority,
        required,
        requirementType: required ? 'REQUIRED' : 'PREFERRED',
        evidenceLevel: evidence?.evidenceLevel || 'MISSING',
        evidenceText: evidence?.evidenceText || 'No supporting evidence found.',
        whyItMatters: required
          ? `Required by the target role${responsibilityMention ? ' and referenced in its responsibilities' : ''}. Missing evidence has a direct impact on your match.`
          : `Preferred by the target role${responsibilityMention ? ' and used in the responsibilities' : ''}. Improving it can strengthen an already viable application.` ,
        recommendedAction: `Learn the fundamentals of ${skill} and add one truthful, role-relevant evidence item.`,
        learningTopics: [`${skill} fundamentals`, `${skill} workflows and best practices`, `Common ${skill} interview concepts`],
        practiceTask: `Complete a hands-on exercise using ${skill} and document what you built.`,
        miniProject: `Build a small portfolio project that demonstrates ${skill} in the context of the target role.`,
        interviewQuestion: `How would you use ${skill} to solve a problem relevant to this role?`,
        estimatedWeeks: required ? 2 : 1,
        status: 'Not Started',
      });
    });

  return Array.from(uniqueGaps.values()).sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
}

module.exports = { PRIORITY_RANK, buildGapRoadmap };
