function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function calculateCareerReadiness({ resume, match, interviewSessions = [], roadmapItems = [] }) {
  const resumeProfile = resume?.parsedProfile || {};
  const evidence = resumeProfile.skillEvidence || [];
  const evidenceStrength = evidence.length
    ? evidence.reduce((sum, item) => sum + (item.confidence || 0), 0) / evidence.length * 100
    : 0;
  const resumeQuality = resume ? (resumeProfile.skills?.length ? 88 : 55) : 0;
  const projectRelevance = match?.factorScores?.projectEvidence || 0;
  const experienceAlignment = match?.factorScores?.experience || 0;
  const requiredSkillCoverage = match?.factorScores?.requirementImportance || 0;
  const jobMatch = match?.overallScore || 0;
  const interviewScores = interviewSessions.flatMap((session) => session.scores || []);
  const interviewReadiness = interviewScores.length
    ? clamp(interviewScores.reduce((sum, score) => sum + score, 0) / interviewScores.length)
    : 0;
  const demonstratedRoadmap = roadmapItems.filter((item) => item.status === 'Demonstrated').length;
  const roadmapProgress = roadmapItems.length ? (demonstratedRoadmap / roadmapItems.length) * 100 : 0;

  const careerReadiness = clamp(
    (resumeQuality * 0.15)
    + (jobMatch * 0.25)
    + (requiredSkillCoverage * 0.15)
    + (evidenceStrength * 0.15)
    + (projectRelevance * 0.1)
    + (experienceAlignment * 0.1)
    + (interviewReadiness * 0.1),
  );

  let applicationDecision = 'LOW MATCH';
  if (jobMatch >= 80 && careerReadiness >= 75 && !(match?.gaps?.length)) applicationDecision = 'READY TO APPLY';
  else if (jobMatch >= 55 || careerReadiness >= 60) applicationDecision = 'APPLY AFTER IMPROVEMENT';

  const reasons = [];
  if (jobMatch >= 75) reasons.push('Strong alignment with the target job.');
  if (projectRelevance >= 70) reasons.push('Relevant project evidence is present.');
  if (match?.gaps?.length) reasons.push(`Missing required skills: ${match.gaps.slice(0, 3).join(', ')}.`);
  if (evidenceStrength < 60) reasons.push('Several skills need stronger supporting evidence.');
  if (interviewReadiness && interviewReadiness < 70) reasons.push('Interview practice is the next improvement area.');

  return {
    jobMatch: clamp(jobMatch),
    careerReadiness,
    interviewReadiness,
    resumeQuality,
    requiredSkillCoverage: clamp(requiredSkillCoverage),
    evidenceStrength: clamp(evidenceStrength),
    projectRelevance: clamp(projectRelevance),
    experienceAlignment: clamp(experienceAlignment),
    roadmapProgress: clamp(roadmapProgress),
    applicationReadiness: {
      decision: applicationDecision,
      reasons: reasons.length ? reasons : ['Analyze a target job and upload a resume to receive personalized readiness guidance.'],
      recommendation: applicationDecision === 'READY TO APPLY'
        ? 'Your current evidence supports applying while continuing to improve.'
        : 'Improve the highest-impact gaps and recheck readiness before targeting similar roles.',
    },
  };
}

module.exports = { calculateCareerReadiness };
