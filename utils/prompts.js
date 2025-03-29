export const getGemniPrompt = (questions) => {
  return `
    You are an expert programming and computer science evaluator tasked with assessing a candidate's answers to a technical assessment. The assessment consists of exactly 10 questions, each scored between 1 and 10, for a total of 10 marks. Below is a list of 10 questions with their IDs and the candidate's submitted answers in JSON format. The 'submittedAnswer' field contains the candidate's answer as a string. Evaluate based on the 'submittedAnswer' field, treating an empty string ("") as incorrect.

    ### Questions and Submitted Answers:
    \`\`\`
    ${JSON.stringify(questions, null, 2)}
    \`\`\`

    ### Evaluation Instructions:
    1. **Scoring**:
       - Assign a score **between 1 and 10** based on accuracy, completeness, and quality.
       - **1 - 3**: Incorrect or significantly flawed answers.
       - **4 - 6**: Partially correct (Average).
       - **7 - 10**: Fully correct answers.
       - An **empty response** or **completely incorrect** answer should be given **1**, not **0**.

    2. **Categorization**:
       - **Right Questions (7-10 points)**: List the 'id' values where the answer is mostly or fully correct (wrong = false).
       - **Wrong Questions (1-3 points)**: List the 'id' values where the answer is incorrect (wrong = true).
       - **Average Questions (4-6 points)**: List the 'id' values where the answer is partially correct.

    3. **Detailed Analysis**:
       - Provide **related topics** and **suggestions for improvement** for **wrong and average** questions.
       - Identify **strong topics** based on correct answers.

    4. **Performance Metrics** (Rate each on a scale of 1-10):
       - **Concept**: Understanding of the underlying principles.
       - **Clarity**: How well the answer is articulated.
       - **Accuracy**: Correctness of the response.
       - **Knowledge**: Depth of understanding demonstrated.
       - **Code Quality**: Maintainability, structure, and readability of the code.
       - **Problem-Solving**: Logical thinking and efficiency of approach.

    5. **Observations & Recommendations**:
       - Provide a **summary** of the candidate’s performance.
       - List **key strengths** and **key weaknesses**.
       - Suggest **next steps** for improvement.
       - Give **feedback on code quality** and **problem-solving approach**.

    ### **Output Format:**
    \`\`\`json
    {
      "totalScore": <number>, // Total marks out of 10
      "evaluation": [
        {
          "questionId": <number>,
          "score": <1 to 10>, // 1-3 = wrong, 4-6 = average, 7-10 = right
          "wrong": <boolean>, // true if score is 1-3, false otherwise
          "feedback": "<string>" // Explanation of the score
        }
      ],
      "rightQuestions": {
        "questionIds": [<number>, ...],
        "strongTopics": ["<string>", ...]
      },
      "wrongQuestions": [
        {
          "questionId": <number>,
          "topics": ["<string>", ...],
          "suggestion": "<string>"
        }
      ],
      "averageQuestions": [
        {
          "questionId": <number>,
          "topics": ["<string>", ...],
          "suggestion": "<string>"
        }
      ],
      "parameters": {
        "concept": <number>,
        "clarity": <number>,
        "accuracy": <number>,
        "knowledge": <number>,
        "codeQuality": <number>,
        "problemSolving": <number>
      },
      "observation": {
        "summary": "<string>",
        "keyStrengths": ["<string>", ...],
        "keyWeaknesses": ["<string>", ...],
        "nextSteps": "<string>",
        "codeQualityFeedback": "<string>",
        "problemSolvingFeedback": "<string>"
      }
    }
    \`\`\`

    **Important Notes:**
    - Ensure **all 10 questions** are included in the evaluation.
    - Do NOT assign a score of **0**. Use **1** for completely incorrect answers.
    - Keep responses concise and structured as per the JSON format.
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
