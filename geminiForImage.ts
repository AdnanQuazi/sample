import { GoogleGenAI, Modality } from "@google/genai";

export async function generateGeminiImage(prompt: string) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  const result = await ai.models.generateContent({
    model: "gemini-2.0-flash-preview-image-generation",
    contents: prompt,
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });

  const parts = result.candidates?.[0]?.content?.parts ?? [];

  const response: { text?: string; image?: string } = {};

  for (const part of parts) {
    if (part.text) {
      response.text = part.text;
    } else if (part.inlineData) {
      response.image = `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  return response;
}
