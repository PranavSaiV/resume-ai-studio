import OpenAI from 'openai';

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) throw new Error('Missing API Key');
const openai = new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' });

export async function analyzeResumeTextWithRetry(text: string, retries = 1): Promise<{ atsScore: number; suggestions: string[]; skills: string[] }> {
  const prompt = `You are an ATS Expert. Analyze this text:
${text}

Return ONLY a JSON object with these keys: { "atsScore": 85, "suggestions": ["string"], "skills": ["string"] }.`;

  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
    });
    let responseText = chatCompletion.choices[0]?.message?.content || "";
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(responseText);
  } catch (error) {
    if (retries > 0) {
      console.warn("Retrying ai request...");
      return analyzeResumeTextWithRetry(text, retries - 1);
    }
    throw new Error("Invalid output received from AI.");
  }
}
