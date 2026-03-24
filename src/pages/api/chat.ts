import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { prisma } from '../../../lib/db';

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) throw new Error('Missing API Key');
const openai = new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body;
    const userId = req.headers['user-id'] as string;

    if (!message || !userId) {
      return res.status(400).json({ message: 'Missing message or userId' });
    }

    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 1
    });

    const resumeContext = resumes.length > 0 ? JSON.stringify(resumes[0]) : "No resume available.";

    const prompt = `You are an AI Assistant for a platform called SkillForge Studio. The user is asking you exactly this:
"${message}"

Here is the data from their most recent resume for context:
${resumeContext}

Respond in a helpful, conversational manner, providing concrete tips or improvements based on their resume data.`;

    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
    });
    const responseText = chatCompletion.choices[0]?.message?.content || "I couldn't generate a response.";

    res.status(200).json({ reply: responseText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to chat with AI' });
  }
}
