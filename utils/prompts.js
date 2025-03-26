export const getGemniPrompt = (questions) => {
  return `
    You are an expert programming and computer science evaluator tasked with assessing a candidate's answers to a technical assessment. The assessment consists of exactly 10 questions, each worth 1 mark, for a total of 10 marks. Below is a list of 10 questions with their IDs and the candidate's submitted answers in JSON format. The 'submittedAnswer' field contains the candidate's answer as a string. Evaluate based on the 'submittedAnswer' field, treating an empty string ("") as incorrect.

    ### Questions and Submitted Answers:
    \`\`\`
    ${JSON.stringify(questions, null, 2)}
    \`\`\`

    ### Evaluation Instructions:
    1. **Scoring**: Assign a score of 1 mark if the 'submittedAnswer' is fully correct based on the question, and 0 marks if it is incorrect, incomplete, or an empty string. Total score must be out of 10.
    2. **Categorization**:
       - **Right Questions**: List the 'id' values where the answer is fully correct (score = 1).
       - **Wrong Questions**: List the 'id' values where the answer is incorrect or significantly flawed (score = 0).
       - **Average Questions**: List the 'id' values where the answer is partially correct but not fully accurate (if applicable; otherwise, treat as wrong).
    3. **Parameters** (rate each on a scale of 0-10 based on the answers):
       - **Concept**: Understanding of the underlying principles.
       - **Clarity**: How well the answer is articulated.
       - **Accuracy**: Correctness of the response.
       - **Knowledge**: Depth of understanding demonstrated.
    5. **Evakuations**:Provide an array where their will be questionId and score which will be 1 if correct and 0 of wrong.

    ### Output Format:
    You MUST return your evaluation as a JSON object with the EXACT structure below. Do NOT provide any additional text outside this JSON, and do NOT deviate from this format. All fields are REQUIRED, and the 'evaluation' array MUST contain exactly 10 entries, one for each question, with a 'wrong' field indicating if the answer is incorrect (true) or correct (false):
    \`\`\`json
    {
      "totalScore": <number>,              // Total marks out of 10 (integer from 0 to 10)
      "evaluation": [                      // Exactly 10 objects, one per question
        {
          "questionId": <number>,          // The 'id' from the question
          "score": <0 or 1>,               // 1 for correct, 0 for incorrect
          "wrong": <boolean>,              // true if incorrect (score = 0), false if correct (score = 1)
          "feedback": "<string>"           // Explanation of the score
        }
      ],
      "rightQuestions": [<number>, ...],   // Array of IDs with score 1
      "wrongQuestions": [<number>, ...],   // Array of IDs with score 0 (fully wrong)
      "averageQuestions": [<number>, ...], // Array of IDs with partial correctness
      "parameters": {
        "concept": <number>,               // Integer from 0-10
        "clarity": <number>,               // Integer from 0-10
        "accuracy": <number>,              // Integer from 0-10
        "knowledge": <number>              // Integer from 0-10
      },
    }
    \`\`\`

    Evaluate the answers based on the provided questions and return the result as a single JSON object in the EXACT format above, with no additional text before or after.
  `;
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
