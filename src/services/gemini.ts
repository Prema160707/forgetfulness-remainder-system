import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const processVoiceCommand = async (command: string) => {
  const prompt = `
    Extract reminder details from this voice command: "${command}"
    Current time: ${new Date().toLocaleString()}
    
    Return a JSON object with:
    - title: string
    - description: string
    - due_time: ISO string (if applicable)
    - priority: "normal" | "high" | "emergency"
    - context_type: "time" | "location" | "routine"
    - confirmation: string (A natural, friendly confirmation message like "Okay, I've set a reminder for your medicine at 8 PM.")
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            due_time: { type: Type.STRING },
            priority: { type: Type.STRING },
            context_type: { type: Type.STRING },
            confirmation: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini voice processing error:", error);
    return null;
  }
};
