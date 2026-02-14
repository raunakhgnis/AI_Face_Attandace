import { GoogleGenAI, Type } from "@google/genai";
import { User, RecognitionResult } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Identifies a user from a live camera frame by comparing it against registered users.
 * Uses Gemini's multimodal capabilities to perform 1:N matching.
 */
export const identifyUser = async (
  currentFrameBase64: string,
  registeredUsers: User[]
): Promise<RecognitionResult> => {
  if (registeredUsers.length === 0) {
    return { matchedUserId: null, confidence: 0, reasoning: "No registered users." };
  }

  // Clean base64 strings (remove data:image/jpeg;base64, prefix if present)
  const cleanFrame = currentFrameBase64.replace(/^data:image\/\w+;base64,/, "");

  // Construct the multimodal prompt
  const parts: any[] = [];
  
  parts.push({
    text: "You are an automated attendance security system. Your task is to identify a person. Below are the 'Reference Images' of registered users, each followed by their ID. The final image is the 'Target Image' from the live camera. Compare the Target Image against the Reference Images based on facial features. If the person in the Target Image matches a Reference Image, return the User ID. If no match is found, return null."
  });

  // Add registered users to the prompt context
  registeredUsers.forEach((user, index) => {
    parts.push({ text: `Reference User ${index + 1} (ID: ${user.id}):` });
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: user.photoBase64.replace(/^data:image\/\w+;base64,/, "")
      }
    });
  });

  parts.push({ text: "Target Image (Live Camera):" });
  parts.push({
    inlineData: {
      mimeType: "image/jpeg",
      data: cleanFrame
    }
  });

  try {
    // Using gemini-3-flash-preview as it supports multimodal input and structured JSON output
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchedUserId: { 
              type: Type.STRING, 
              description: "The ID of the matched user, or null if no match found.",
              nullable: true
            },
            confidence: { 
              type: Type.NUMBER, 
              description: "Confidence score between 0 and 1." 
            },
            reasoning: {
              type: Type.STRING,
              description: "Brief explanation of why the face matched or didn't match."
            }
          },
          required: ["confidence", "reasoning"],
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini");
    }

    const result = JSON.parse(resultText) as RecognitionResult;
    return result;

  } catch (error) {
    console.error("Gemini Recognition Error:", error);
    return { matchedUserId: null, confidence: 0, reasoning: "API Error" };
  }
};