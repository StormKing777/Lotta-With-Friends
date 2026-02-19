import { GoogleGenAI, Type } from "@google/genai";
import { GeminiOracleResponse } from "../types";
import { GAME_CONFIG } from "../constants";

export const generateLuckyNumbers = async (
  prompt: string
): Promise<GeminiOracleResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const config = GAME_CONFIG;

  const systemInstruction = `
    You are a mystical Lottery Oracle. 
    The user will give you a prompt (a dream, a feeling, a date, etc.).
    You must interpret this prompt to generate a valid set of lottery numbers for the game "${config.name}".
    
    Rules:
    - Generate ${config.mainBallCount} unique numbers between 1 and ${config.mainBallMax}.
    - Generate 1 special number (the ${config.specialBallName}) between 1 and ${config.specialBallMax}.
    - Provide a short, mystical reasoning for why these numbers were chosen based on the prompt.
    
    Return the response as a valid JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            numbers: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER },
              description: `The ${config.mainBallCount} main numbers.`,
            },
            special: {
              type: Type.NUMBER,
              description: `The ${config.specialBallName} number.`,
            },
            reasoning: {
              type: Type.STRING,
              description: "A mystical explanation of the numbers.",
            },
          },
          required: ["numbers", "special", "reasoning"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as GeminiOracleResponse;
    }
    throw new Error("No response text from Gemini");
  } catch (error) {
    console.error("Error generating lucky numbers:", error);
    // Fallback if API fails
    const fallbackNumbers = new Set<number>();
    while(fallbackNumbers.size < config.mainBallCount) fallbackNumbers.add(Math.floor(Math.random() * config.mainBallMax) + 1);
    return {
      numbers: Array.from(fallbackNumbers),
      special: Math.floor(Math.random() * config.specialBallMax) + 1,
      reasoning: " The mists were too thick to see clearly, but these numbers emerged from the void.",
    };
  }
};