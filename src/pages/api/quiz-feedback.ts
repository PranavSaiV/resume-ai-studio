import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
  
  const { topics } = req.body;
  if (!topics || topics.length === 0) return res.status(400).json({ message: 'No topics provided' });

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a technical mentor. Based on these failed quiz topics: ${topics.join(", ")}, provide a brief, encouraging study tip and one specific concept the user should review. Please keep it to a maximum of 2 sentences.`;

    const result = await model.generateContent(prompt);
    const suggestion = result.response.text().trim();

    return res.status(200).json({ suggestion });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to generate feedback' });
  }
}
