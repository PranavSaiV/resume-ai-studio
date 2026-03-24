import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) throw new Error('Missing API Key');
const openai = new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
  
  const { topics } = req.body;
  if (!topics || topics.length === 0) return res.status(400).json({ message: 'No topics provided' });

  try {
    const prompt = `You are a technical mentor. Based on these failed quiz topics: ${topics.join(", ")}, provide a brief, encouraging study tip and one specific concept the user should review. Please keep it to a maximum of 2 sentences.`;

    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
    });
    const suggestion = chatCompletion.choices[0]?.message?.content?.trim() || "Keep learning!";

    return res.status(200).json({ suggestion });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to generate feedback' });
  }
}
