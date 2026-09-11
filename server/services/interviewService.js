function buildInterviewQuestions({ strengths = [], gaps = [], skillEvidence = [], targetRole = 'this role' }) {
  const questions = [
    {
      id: 'technical-strength',
      category: 'Technical',
      question: strengths[0] ? `Explain how you used ${strengths[0]} in a real project and the trade-offs you made.` : 'Describe the most technically challenging project you have completed.',
      hint: 'Explain the problem, your implementation, and the measurable result.',
    },
    {
      id: 'resume-defense',
      category: 'Resume Verification',
      question: skillEvidence[0] ? `Your resume cites ${skillEvidence[0].skill}. What evidence best demonstrates your level of hands-on experience?` : 'Choose one resume skill and explain the strongest evidence behind it.',
      hint: 'Use a concrete project, experience, or result from your resume.',
    },
    {
      id: 'project-explanation',
      category: 'Project-based',
      question: 'Walk through a project you built: what was the goal, what did you personally implement, and what changed because of it?',
      hint: 'Use Situation, Task, Action, and Result in that order.',
    },
    {
      id: 'job-specific',
      category: 'JD-based',
      question: `What would you prioritize in your first 30 days in ${targetRole}, based on the role requirements?`,
      hint: 'Connect your existing strengths to the job responsibilities.',
    },
    {
      id: 'skill-gap',
      category: 'Skill-gap based',
      question: gaps[0] ? `This role asks for ${gaps[0]}. What is your plan to build credible evidence for it?` : 'What skill would you improve next for this role, and how would you prove that improvement?',
      hint: 'Give a specific learning, practice, and portfolio plan.',
    },
    {
      id: 'behavioral',
      category: 'Behavioral',
      question: 'Tell me about a time you faced an unexpected constraint and how you adapted your approach.',
      hint: 'Focus on your decision-making and the outcome, not only the situation.',
    },
  ];

  return questions;
}

function evaluateInterviewAnswer(answer = '', question = {}) {
  const text = String(answer).trim();
  const wordCount = text ? text.split(/\s+/).length : 0;
  const dimensions = {
    relevance: /\b(project|role|system|requirement|skill|problem|customer|team)\b/i.test(text) ? 80 : 45,
    technicalCorrectness: /\b(because|trade[- ]?off|implemented|designed|tested|measured|architecture|process)\b/i.test(text) ? 80 : 50,
    completeness: wordCount >= 45 ? 85 : wordCount >= 25 ? 65 : 40,
    clarity: wordCount >= 20 && !/[.!?]{3,}/.test(text) ? 80 : 55,
    evidenceUsage: /\b\d+(?:\.\d+)?\s*(?:%|percent|ms|seconds|users|years|months|x)?\b|\b(result|outcome|impact|improved|reduced|increased|delivered)\b/i.test(text) ? 85 : 45,
  };
  const entries = Object.entries(dimensions);
  const weakest = entries.reduce((current, item) => item[1] < current[1] ? item : current, entries[0]);
  const score = Math.round(entries.reduce((sum, [, value]) => sum + value, 0) / entries.length);
  const feedback = entries.map(([label, value]) => ({
    label,
    score: value,
    pass: value >= 70,
    detail: value >= 70
      ? `${label} is supported by your response.`
      : `Strengthen ${label} with a more specific explanation or example.`,
  }));

  return {
    score,
    level: score >= 80 ? 'Excellent' : score >= 65 ? 'Good' : score >= 45 ? 'Fair' : 'Needs Work',
    wordCount,
    dimensions,
    weakestArea: weakest[0],
    feedback,
    questionCategory: question.category,
  };
}

function selectAdaptiveQuestion(questions, answeredIds = [], weakestArea = '') {
  const remaining = questions.filter((question) => !answeredIds.includes(question.id));
  if (!remaining.length) return null;
  if (/technicalCorrectness/i.test(weakestArea)) return remaining.find((question) => question.category === 'Technical' || question.category === 'Project-based') || remaining[0];
  if (/evidenceUsage|completeness/i.test(weakestArea)) return remaining.find((question) => question.category === 'Resume Verification' || question.category === 'Behavioral') || remaining[0];
  if (/relevance/i.test(weakestArea)) return remaining.find((question) => question.category === 'JD-based' || question.category === 'Skill-gap based') || remaining[0];
  return remaining[0];
}

module.exports = { buildInterviewQuestions, evaluateInterviewAnswer, selectAdaptiveQuestion };
