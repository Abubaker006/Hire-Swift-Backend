const scoreQuestion = (question, techStack) => {
  const techStackMatch = techStack.includes(
    question.classification.toLowerCase()
  )
    ? 1
    : 0;

  const difficultyScore = { Easy: 1, Medium: 2, Hard: 3 }[question.difficulty];
  const relevanceWeight = techStackMatch ? 1 : 0.5;
  const typePreference = question.type === "coding" ? 0.8 : 0.6;

  return (
    techStackMatch * 0.5 +
    difficultyScore * 0.3 +
    relevanceWeight * 0.15 +
    typePreference * 0.05
  );
};

export { scoreQuestion };
