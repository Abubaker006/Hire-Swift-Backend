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
  temperature: 0.7, //  lower temp means more better response.
  topP: 0.9, 
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
  responseSchema: {
    type: "object",
    properties: {
      totalScore: {
        type: "integer",
        description: "Total marks out of 10.",
      },
      evaluation: {
        type: "array",
        description: "List of evaluations for each question.",
        items: {
          type: "object",
          properties: {
            questionId: { type: "integer", description: "ID of the question." },
            score: {
              type: "integer",
              description: "1 for correct, 0 for incorrect.",
            },
            wrong: {
              type: "boolean",
              description: "True if incorrect, false if correct.",
            },
            feedback: {
              type: "string",
              description: "Explanation for the given score.",
            },
          },
          required: ["questionId", "score", "wrong", "feedback"],
        },
      },
      rightQuestions: {
        type: "array",
        description: "List of question IDs where the answer is fully correct.",
        items: { type: "integer" },
      },
      wrongQuestions: {
        type: "array",
        description: "List of question IDs where the answer is incorrect.",
        items: { type: "integer" },
      },
      averageQuestions: {
        type: "array",
        description: "List of question IDs with partial correctness.",
        items: { type: "integer" },
      },
      parameters: {
        type: "object",
        properties: {
          concept: {
            type: "integer",
            description: "Understanding of core concepts (0-10).",
          },
          clarity: {
            type: "integer",
            description: "Clarity and articulation (0-10).",
          },
          accuracy: {
            type: "integer",
            description: "Correctness of responses (0-10).",
          },
          knowledge: {
            type: "integer",
            description: "Depth of understanding (0-10).",
          },
        },
        required: ["concept", "clarity", "accuracy", "knowledge"],
      },
      observation: {
        type: "string",
        description: "Summary of the candidate's performance.",
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
    console.log("Respnse of evaluation by gemini is this", structuredResponse);
    return structuredResponse;
  } catch (error) {
    console.error("Error occured while evaluation from gemini", error);
    throw new Error("Interna Server Error");
  }
};
