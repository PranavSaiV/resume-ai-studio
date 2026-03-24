import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function analyzeResumeTextWithRetry(text: string, retries = 1): Promise<{ atsScore: number; suggestions: string[]; skills: string[] }> {
  const prompt = `You are an ATS Expert. Analyze this text:
${text}

Return ONLY a JSON object with these keys: { "atsScore": 85, "suggestions": ["string"], "skills": ["string"] }.`;

  try {
    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(responseText);
  } catch (error) {
    if (retries > 0) {
      console.warn("Retrying gemini request...");
      return analyzeResumeTextWithRetry(text, retries - 1);
    }
    throw new Error("Invalid output received from AI.");
  }
}
