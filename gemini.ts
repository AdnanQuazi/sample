import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export async function* streamGeminiResponse(prompt: string, history: Message[] = []) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  console.log("TEXT STREAMING CALLED");
  const contents = [
    ...history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    })),
    { role: 'user', parts: [{ text: prompt }] }
  ];

  const result = await model.generateContentStream({
    contents,
  });

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }
}
