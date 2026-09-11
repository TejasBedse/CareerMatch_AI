function compareJobs({ resume, jobs, calculateMatch }) {
  return jobs
    .map((job) => {
      const result = calculateMatch(resume.parsedProfile, job);
      return {
        jdId: job.jdId,
        title: job.title,
        company: job.company,
        overallScore: result.overallScore,
        strengths: result.strengths,
        gaps: result.gaps,
        preferredGaps: result.preferredGaps,
        factorScores: result.factorScores,
        topGap: result.gaps[0] || result.preferredGaps[0] || null,
      };
    })
    .sort((a, b) => b.overallScore - a.overallScore);
}

module.exports = { compareJobs };
