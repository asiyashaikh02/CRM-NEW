
import { GoogleGenAI } from "@google/genai";

/**
 * Fetches sales outreach advice using Gemini 3 Pro for complex reasoning.
 * Creates a new instance on each call to ensure the latest API key is used.
 */
export const getSalesAdvice = async (leadName: string, value: number) => {
  // Initialize GoogleGenAI with a named parameter as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    // Using gemini-3-pro-preview for complex reasoning and business strategy tasks.
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Suggest a brief 3-step outreach strategy for a new lead: ${leadName} with a potential contract value of $${value}. Keep it professional and concise.`,
      config: {
        temperature: 0.7,
      }
    });
    // Directly access the .text property from GenerateContentResponse.
    return response.text || "Unable to generate advice at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI Assistant is currently offline.";
  }
};

/**
 * Fetches operations optimization tips using Gemini 3 Pro.
 * Creates a new instance on each call to ensure the latest API key is used.
 */
export const getOperationsOptimization = async (company: string, stage: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Provide 2 quick tips to move ${company} from the ${stage} stage to the next stage faster in an execution workflow.`,
      config: {
        temperature: 0.5,
      }
    });
    return response.text || "No optimization tips available.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI Assistant is currently offline.";
  }
};
