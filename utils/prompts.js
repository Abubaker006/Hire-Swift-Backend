export const getGemniPrompt = (questions, answers) => {
  let prompt = `You are an AI evaluator. Analyze and evaluate the following responses for multiple questions.\n\n`;

  questions.forEach((question, index) => {
    const answerObj = answers.find(
      (ans) => String(ans.questionId) === String(question.id)
    );
    const userAnswer =
      answerObj?.submittedAnswer[0]?.answer || "No answer provided";

    prompt += `### Question ${index + 1}:\n`;
    prompt += `**Question:** "${question.question}"\n`;
    prompt += `**Response:** "${userAnswer}"\n\n`;
  });

  prompt += `
Evaluate each question individually based on the following criteria (scores should be between 0 and 10):
- **Concepts**: Understanding of key concepts.
- **Knowledge**: Accuracy, thoroughness, and detail.
- **Clarity**: Organization and conciseness.
- **Accuracy**: Factual correctness.
- **Pass**: True/False if the response is acceptable.
- **Observations**: A short explanation of the evaluation.

Then, provide an overall assessment of the entire response set.

### **Response Format (return only valid JSON):**
\`\`\`json
{
  "questions": [
    {
      "question": "<question_text>",
      "concepts": <score>, 
      "knowledge": <score>, 
      "clarity": <score>,
      "accuracy": <score>, 
      "pass": <true|false>, 
      "observations": "<brief evaluation summary>"
    }
  ],
  "overallAssessment": {
    "concepts": <average_score>, 
    "knowledge": <average_score>, 
    "clarity": <average_score>,
    "accuracy": <average_score>, 
    "pass": <true|false>, 
    "observations": "<brief overall evaluation summary>"
  }
}
\`\`\`
Do not include explanations outside the JSON format.`;

  return prompt;
};

export const getGroqPrompt = (question, userAnswer) => {
  return {
    role: "user",
    content: `Please evaluate the following response to the question: "${question}"\nResponse: "${userAnswer}"\n\nUse the following criteria to assign scores (out of 10) and additional observations for the evaluation:
  
        - **Concepts**: Rate how well the response demonstrates a deep understanding of the key concepts. Does it accurately address the core themes of the question?
        - **Knowledge**: Evaluate the accuracy, thoroughness, and detail of the response. Does it incorporate relevant facts, evidence, or insights?
        - **Clarity**: Assess how clear, well-organized, and concise the response is. Is the information communicated clearly and without ambiguity?
        - **Accuracy**: Consider the factual correctness and precision of the response. Does the answer avoid errors and misleading information?
        - **Pass**: Based on your overall evaluation, determine if the response is sufficiently comprehensive and correct (true or false).
  
        Additionally, provide a brief summary of your reasoning in the **observations** section to support the scores given.
  
        Respond with a JSON object containing the following structure:
        {
          "concepts": <score>, 
          "knowledge": <score>, 
          "clarity": <score>,
          "accuracy": <score>, 
          "pass": <true|false>, 
          "observations": "<brief evaluation summary>"
        }`,
  };
};
