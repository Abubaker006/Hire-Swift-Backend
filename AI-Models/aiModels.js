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
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
  responseSchema: {
    type: "object",
    properties: {
      concepts: {
        type: "integer",
        description: "Score out of 10 for the understanding of the key concept",
      },
      knowledge: {
        type: "integer",
        description:
          "Score out of 10 for the accuracy and detail of the explanation",
      },
      clarity: {
        type: "integer",
        description:
          "Score out of 10 for the clarity and conciseness of the explanation",
      },
      accuracy: {
        type: "integer",
        description:
          "Score out of 10 and indicates if the answer is accurate or not",
      },
      pass: {
        type: "boolean",
        description: "Boolean value indicating if the answer is correct or not",
      },
      observations: {
        type: "string",
        description: "Any additional observations or comments",
      },
    },
    required: ["concepts", "knowledge", "clarity", "accuracy", "pass"],
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
