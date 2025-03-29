import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import "dotenv/config";

// gemini configuration
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

const generationConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
  responseSchema: {
    type: "object",
    properties: {
      totalScore: {
        type: "integer",
        description: "Total score out of 10.",
      },
      evaluation: {
        type: "array",
        description: "Evaluation details for each question.",
        items: {
          type: "object",
          properties: {
            questionId: {
              type: "integer",
              description: "The unique ID of the question.",
            },
            score: {
              type: "integer",
              description: "Score assigned to the question (1-10).",
            },
            category: {
              type: "string",
              enum: ["wrong", "average", "right"],
              description:
                "Categorization based on score: 'wrong' (1-3), 'average' (4-6), 'right' (7-10).",
            },
            feedback: {
              type: "string",
              description: "Detailed feedback on the answer.",
            },
          },
          required: ["questionId", "score", "category", "feedback"],
        },
      },
      rightQuestions: {
        type: "object",
        description: "Questions answered correctly and related strong topics.",
        properties: {
          questionIds: {
            type: "array",
            description:
              "List of correctly answered question IDs (score 7-10).",
            items: { type: "integer" },
          },
          strongTopics: {
            type: "array",
            description: "Topics where the candidate performed well.",
            items: { type: "string" },
          },
        },
      },
      wrongQuestions: {
        type: "array",
        description: "List of questions answered incorrectly (score 1-3).",
        items: {
          type: "object",
          properties: {
            questionId: { type: "integer", description: "Question ID." },
            topics: {
              type: "array",
              items: { type: "string" },
              description: "Relevant topics.",
            },
            suggestion: {
              type: "string",
              description: "How to improve understanding.",
            },
          },
          required: ["questionId", "topics", "suggestion"],
        },
      },
      averageQuestions: {
        type: "array",
        description:
          "List of questions answered partially correctly (score 4-6).",
        items: {
          type: "object",
          properties: {
            questionId: { type: "integer", description: "Question ID." },
            topics: {
              type: "array",
              items: { type: "string" },
              description: "Relevant topics.",
            },
            suggestion: {
              type: "string",
              description: "How to improve understanding.",
            },
          },
          required: ["questionId", "topics", "suggestion"],
        },
      },
      parameters: {
        type: "object",
        description: "Performance metrics (each scored 0-10).",
        properties: {
          concept: {
            type: "integer",
            description: "Understanding of concepts (0-10).",
          },
          clarity: {
            type: "integer",
            description: "Clarity of explanation (0-10).",
          },
          accuracy: {
            type: "integer",
            description: "Correctness of responses (0-10).",
          },
          knowledge: {
            type: "integer",
            description: "Depth of understanding (0-10).",
          },
          codeQuality: {
            type: "integer",
            description: "Code quality and best practices (0-10).",
          },
          problemSolving: {
            type: "integer",
            description: "Approach to problem-solving (0-10).",
          },
        },
        required: [
          "concept",
          "clarity",
          "accuracy",
          "knowledge",
          "codeQuality",
          "problemSolving",
        ],
      },
      observation: {
        type: "object",
        description:
          "Summary of the candidate’s performance and improvement areas.",
        properties: {
          summary: {
            type: "string",
            description: "Overall performance summary.",
          },
          keyStrengths: {
            type: "array",
            description: "Topics where the candidate performed well.",
            items: { type: "string" },
          },
          keyWeaknesses: {
            type: "array",
            description: "Topics needing improvement.",
            items: { type: "string" },
          },
          nextSteps: {
            type: "string",
            description: "Recommended actions for improvement.",
          },
          codeQualityFeedback: {
            type: "string",
            description: "Feedback on code quality.",
          },
          problemSolvingFeedback: {
            type: "string",
            description: "Feedback on problem-solving approach.",
          },
        },
        required: [
          "summary",
          "keyStrengths",
          "keyWeaknesses",
          "nextSteps",
          "codeQualityFeedback",
          "problemSolvingFeedback",
        ],
      },
    },
    required: [
      "totalScore",
      "evaluation",
      "rightQuestions",
      "wrongQuestions",
      "averageQuestions",
      "parameters",
      "observation",
    ],
  },
};

export const geminiEvaluation = async (prompt) => {
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(prompt);
    const structuredResponse = result.response.text();
    return structuredResponse;
  } catch (error) {
    console.error("Error occured while evaluation from gemini", error);
    throw new Error("Interna Server Error");
  }
};
