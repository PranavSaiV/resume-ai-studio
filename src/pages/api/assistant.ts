import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';
import OpenAI from 'openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('Missing GROQ_API_KEY');
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const userId = req.headers['user-id'] as string;
    const { message, resumeId } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ message: 'Bad Request' });
    }

    const openai = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: apiKey,
    });
    
    let resume = null;
    if (resumeId) {
      resume = await prisma.resume.findUnique({ where: { id: resumeId, userId } });
    } else {
      resume = await prisma.resume.findFirst({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      });
    }

    const resumeContent = resume ? JSON.stringify({
      title: resume.title,
      personalInfo: resume.personalInfo,
      experience: resume.experience,
      education: resume.education,
      skills: resume.skills,
      content: resume.content
    }) : "No resume provided.";

    const systemPrompt = `You are the SkillForge Career Mentor. Using this resume: ${resumeContent}, provide fast, accurate, and actionable career advice. If the resume is empty, guide them on how to fill it.`;

    const chatCompletion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      model: 'llama-3.1-8b-instant',
    });
    
    return res.status(200).json({ reply: chatCompletion.choices[0]?.message?.content || "" });
  } catch (error: any) {
    console.error("AI Assistant Error:", error);
    return res.status(200).json({ message: "System is busy: " + (error.message || String(error)) });
  }
}
