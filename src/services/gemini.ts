import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const model = "gemini-3-flash-preview";

export async function getChatResponse(message: string, history: { role: "user" | "model"; parts: { text: string }[] }[]) {
  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: "You are EduGenius AI, a helpful and encouraging educational assistant. Your goal is to help students learn by explaining concepts clearly, providing examples, and encouraging critical thinking. Avoid just giving answers; instead, guide the student to find the answer themselves when appropriate.",
    },
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}

export async function generateQuiz(topic: string) {
  const response = await ai.models.generateContent({
    model,
    contents: `Generate a 5-question multiple-choice quiz about ${topic}. Return the response in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["question", "options", "correctAnswer", "explanation"],
        },
      },
    },
  });

  return JSON.parse(response.text || "[]");
}

export async function summarizeText(text: string) {
  const response = await ai.models.generateContent({
    model,
    contents: `Summarize the following text into key bullet points and a brief conclusion: \n\n${text}`,
  });
  return response.text;
}

export async function generateStudyPlan(goal: string, timeframe: string) {
  const response = await ai.models.generateContent({
    model,
    contents: `Create a detailed study plan for: ${goal}. Timeframe: ${timeframe}. Include daily tasks and milestones.`,
  });
  return response.text;
}
