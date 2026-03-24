import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../../../lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an AI Assistant for a platform called SkillForge Studio. The user is asking you exactly this:
"${message}"

Here is the data from their most recent resume for context:
${resumeContext}

Respond in a helpful, conversational manner, providing concrete tips or improvements based on their resume data.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.status(200).json({ reply: responseText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to chat with AI' });
  }
}
